import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiChatService } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { FiPlus, FiTrash2, FiEdit2, FiChevronRight, FiChevronDown, } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import RenameChatModal from "../../components/RenameModal.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import { useConfirm } from "../../components/ConfirmProvider.jsx";

const uuid = () =>
    (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
    Math.random().toString(36).slice(2);

export default function AiChat() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const toast = useToast();
    const confirm = useConfirm();

    const userId = user?.id_usuario || user?.id;

    const [activeSessionId, setActiveSessionId] = useState(null);
    const [input, setInput] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [renameState, setRenameState] = useState({
        open: false,
        session: null,
    });

    const messagesContainerRef = useRef(null);

    const sessionsQuery = useQuery({
        queryKey: ["ai-chat", "sessions"],
        queryFn: async () => {
        const { data } = await aiChatService.listSessions();
        return data;
        },
    });

    const messagesQuery = useQuery({
        queryKey: ["ai-chat", "sessions", activeSessionId, "messages"],
        queryFn: async () => {
        if (!activeSessionId) return [];
        const { data } = await aiChatService.getMessages(activeSessionId);
        return (data || []).map((m) => ({
            id: m.id_message,
            from: m.role === "assistant" ? "bot" : "user",
            text: m.content,
            created_at: m.created_at,
        }));
        },
        enabled: !!activeSessionId,
    });

    useEffect(() => {
        if (messagesContainerRef.current) {
        const el = messagesContainerRef.current;
        el.scrollTop = el.scrollHeight;
        }
    }, [messagesQuery.data, activeSessionId]);

    const createSessionMutation = useMutation({
        mutationFn: (titulo) => aiChatService.createSession(titulo),
        onSuccess: (res) => {
        const session = res.data;
        queryClient.invalidateQueries(["ai-chat", "sessions"]);
        setActiveSessionId(session.id_chat);
        setDropdownOpen(false);
        queryClient.setQueryData(
            ["ai-chat", "sessions", session.id_chat, "messages"],
            (prev) => prev || []
        );
        },
    });

    const renameSessionMutation = useMutation({
        mutationFn: ({ id_chat, titulo }) =>
        aiChatService.renameSession(id_chat, titulo),
        onSuccess: () => {
        queryClient.invalidateQueries(["ai-chat", "sessions"]);
        toast.success("Chat renombrado con éxito.");
        },
    });

    const deleteSessionMutation = useMutation({
        mutationFn: (id_chat) => aiChatService.deleteSession(id_chat),
        onSuccess: (_res, id_chat) => {
        queryClient.invalidateQueries(["ai-chat", "sessions"]);
        queryClient.removeQueries([
            "ai-chat",
            "sessions",
            id_chat,
            "messages",
        ]);
        setActiveSessionId((prev) => (prev === id_chat ? null : prev));
        },
    });

    const sendMessageMutation = useMutation({
        mutationFn: ({ id_chat, message }) =>
        aiChatService.sendMessage({ id_chat, message }),

        onMutate: ({ id_chat, message }) => {
        const now = new Date().toISOString();
        const typingId = uuid();

        queryClient.setQueryData(
            ["ai-chat", "sessions", id_chat, "messages"],
            (prev = []) => [
            ...prev,
            { id: uuid(), from: "user", text: message, created_at: now },
            {
                id: typingId,
                from: "bot",
                text: "",
                created_at: now,
                streaming: true,
            },
            ]
        );

        return { id_chat, typingId };
        },

        onSuccess: (res, _vars, context) => {
        const data = res?.data || res || {};
        const reply =
            data.reply ||
            data.text ||
            data.answer ||
            data.result ||
            data.output ||
            (typeof data === "string" ? data : "") ||
            "";

        const fullText =
            reply.trim() ||
            "Lo siento, no tengo una respuesta en este momento.";

        const { id_chat, typingId } = context || {};

        const words = fullText.split(" ");
        let index = 0;

        const interval = setInterval(() => {
            index += 1;

            queryClient.setQueryData(
            ["ai-chat", "sessions", id_chat, "messages"],
            (prev = []) =>
                prev.map((m) => {
                if (m.id !== typingId) return m;
                const current = words.slice(0, index).join(" ");
                return {
                    ...m,
                    text: current,
                    streaming: index < words.length,
                };
                })
            );

            if (messagesContainerRef.current) {
                const el = messagesContainerRef.current;
                el.scrollTop = el.scrollHeight;
            }

            if (index >= words.length) {
            clearInterval(interval);
            }
        }, 30);
        },

        onError: (error, _vars, context) => {
        const { id_chat, typingId } = context || {};
        const msg =
            error?.response?.data?.message ||
            error?.message ||
            "Error al obtener respuesta del asistente.";

        queryClient.setQueryData(
            ["ai-chat", "sessions", id_chat, "messages"],
            (prev = []) =>
            prev.map((m) =>
                m.id === typingId
                ? { ...m, text: `Error: ${msg}`, streaming: false }
                : m
            )
        );
        },
    });

    const handleCreateSession = () => {
        const base = "Consulta nueva";
        const n = (sessionsQuery.data?.length || 0) + 1;
        createSessionMutation.mutate(`${base} #${n}`);
    };

    const openRenameModal = (session) => {
        setRenameState({ open: true, session });
    };

    const handleDeleteSession = async (session) => {
        const ok = await confirm({
            title: "Eliminar chat",
            description: "¿Estás seguro de que querés eliminar este chat?",
            confirmText: "Eliminar",
            tone: "danger"
        });
        if (!ok) return;
        deleteSessionMutation.mutate(session.id_chat);
        toast.success("Chat eliminado con éxito.");
    };

    const sendWithSession = async (message) => {
        let sessionId = activeSessionId;

        if (!sessionId) {
        const base = "Consulta nueva";
        const n = (sessionsQuery.data?.length || 0) + 1;
        try {
            const res = await createSessionMutation.mutateAsync(
            `${base} #${n}`
            );
            const session = res.data || res;
            sessionId = session.id_chat;
            setActiveSessionId(sessionId);
        } catch (err) {
            console.error("[AI-CHAT] Error creando sesión automática:", err);
            return;
        }
        }

        sendMessageMutation.mutate({ id_chat: sessionId, message });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;
        setInput("");
        await sendWithSession(trimmed);
    };

    const handleQuickQuestion = async (q) => {
        if (sendMessageMutation.isPending) return;
        await sendWithSession(q);
    };

    const sessions = sessionsQuery.data || [];
    const activeSession =
        sessions.find((s) => s.id_chat === activeSessionId) || null;
    const activeMessages = messagesQuery.data || [];
    const isEmptySession =
        !!activeSessionId && activeMessages.length === 0;

    const userInitials =
        (user?.apellido?.[0] || "") +
        (user?.nombre?.[0] || user?.email?.[0] || "") || "U";

    const presetQuestions = [
        "¿Cuántos usuarios activos hay?",
        "¿Qué contratos vencen este mes?",
        "Cuántos legajos están incompletos?",
    ];

    return (
        <div className="flex flex-col pt-8 pb-6 h-[100vh] overflow-hidden">
        <RenameChatModal
            open={renameState.open}
            initialTitle={renameState.session?.titulo || ""}
            onCancel={() => setRenameState({ open: false, session: null })}
            onConfirm={(newTitle) => {
            const session = renameState.session;
            if (!session) return;
            renameSessionMutation.mutate(
                { id_chat: session.id_chat, titulo: newTitle },
                {
                onSuccess: () =>
                    setRenameState({ open: false, session: null }),
                }
            );
            }}
        />

        <div className="flex justify-center mb-6 shrink-0">
            <div className="relative ">
            <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="inline-flex cursor-pointer items-center gap-2 px-6 py-2 text-sm font-semibold rounded-full bg-[#050f18] border border-slate-700 hover:border-[#19F124] transition-colors"
            >
                <span>{activeSession?.titulo || "Nuevo chat"}</span>
                <FiChevronDown
                className={`transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                }`}
                />
                <span className="ml-1">
                <FiPlus />
                </span>
            </button>   

            {dropdownOpen && (
                <div className="absolute left-1/2 z-20 mt-3 w-80 -translate-x-1/2 rounded-2xl bg-[#050f18] border border-slate-700 shadow-xl p-2 space-y-1">
                <button
                    type="button"
                    onClick={handleCreateSession}
                    className="flex items-center cursor-pointer justify-center w-full gap-2 px-3 py-2 text-xs font-medium rounded-xl bg-[#19F124] text-[#030c14] hover:bg-[#3af743] transition-colors"
                >
                    <FiPlus />
                    <span>Nuevo chat</span>
                </button>

                <div className="w-full h-px my-2 bg-slate-700/60" />

                {sessionsQuery.isLoading ? (
                    <p className="px-2 py-1 text-xs text-slate-400">
                    Cargando sesiones…
                    </p>
                ) : !sessions.length ? (
                    <p className="px-2 py-1 text-xs text-slate-400">
                    Todavía no tenés chats. Escribí tu primera pregunta o
                    creá uno nuevo.
                    </p>
                ) : (
                    sessions.map((s) => (
                    <div
                        key={s.id_chat}
                        className="flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-[#0b1823] transition-colors"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setActiveSessionId(s.id_chat);
                                setDropdownOpen(false);
                            }}
                            className="flex-1 text-left truncate cursor-pointer"
                        >
                            {s.titulo}
                        </button>
                        <div className="flex items-center gap-1 ml-2">
                        <button
                            type="button"
                            onClick={() => openRenameModal(s)}
                            className="p-1 rounded cursor-pointer hover:bg-slate-700/70"
                            title="Renombrar chat"
                        >
                            <FiEdit2 className="w-3 h-3" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDeleteSession(s)}
                            className="p-1 rounded cursor-pointer hover:bg-red-600/80"
                            title="Eliminar chat"
                        >
                            <FiTrash2 className="w-3 h-3" />
                        </button>
                        </div>
                    </div>
                    ))
                )}
                </div>
            )}
            </div>
        </div>

        <div className="w-[95%] m-auto h-[0.1rem] rounded-full bg-white/10"/>

        <div className="flex flex-col items-center flex-1 min-h-0 pt-5">
            <div className="flex flex-col items-center flex-1 w-full min-h-0">
            {activeSessionId && !isEmptySession ? (
                <div className="flex flex-col w-full h-full max-w-full">
                <div
                    ref={messagesContainerRef}
                    className="flex-1 pb-4 space-y-5 overflow-y-auto"
                >
                    {activeMessages.map((m) => {
                    const isUser = m.from === "user";

                    if (!isUser && m.streaming && !m.text) {
                        return (
                        <div
                            key={m.id}
                            className="flex items-start gap-2 max-w-[60%] pl-25"
                        >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#030c14] border border-[#19F124] text-[#19F124] text-xs font-semibold shrink-0">
                            U
                            </div>
                            <div className="flex items-center gap-2 px-4 py-3 rounded-3xl bg-[#050f18] border border-slate-700">
                            <span className="inline-flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.2s]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.1s]" />
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                            </span>
                            </div>
                        </div>
                        );
                    }

                    if (isUser) {
                        return (
                        <div key={m.id} className="flex justify-end">
                            <div className="flex items-end gap-2 max-w-[60%] pr-25">
                            <div className="px-4 py-3 text-sm rounded-3xl bg-[#101922] whitespace-pre-wrap">
                                {m.text}
                            </div>
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#19F124] text-[#030c14] text-xs font-semibold shrink-0">
                                {userInitials}
                            </div>
                            </div>
                        </div>
                        );
                    }

                    return (
                        <div key={m.id} className="flex justify-start">
                        <div className="flex items-start gap-2 max-w-[60%] pl-25">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#030c14] border border-[#19F124] text-[#19F124] text-xs font-semibold shrink-0">
                            U
                            </div>
                            <div className="px-4 py-3 text-sm rounded-3xl bg-[#050f18] border border-slate-700 whitespace-pre-wrap">
                                <ReactMarkdown>{m.text}</ReactMarkdown>
                            </div>
                        </div>
                        </div>
                    );
                    })}
                </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center">
                <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[#050f18] border border-[#19F124]">
                    <span className="text-4xl font-semibold text-[#19F124]">
                    U
                    </span>
                </div>
                <div className="space-y-1">
                    <p className="text-[0.7rem] uppercase tracking-[0.2em] text-slate-400">
                    Clampy, tu asistente de IA para RRHH
                    </p>
                    <p className="text-lg font-semibold">¿Cómo estás hoy?</p>
                </div>
                </div>
            )}
            </div>

            <div className="w-full max-w-4xl mx-auto mt-4 shrink-0">
            {(!activeSessionId || isEmptySession) && (
                <div className="flex justify-center gap-4 mb-4">
                {presetQuestions.map((q) => (
                    <button
                    key={q}
                    type="button"
                    onClick={() => handleQuickQuestion(q)}
                    className="flex flex-col items-center cursor-pointer justify-center flex-1 px-6 py-3 text-xs text-left rounded-2xl bg-[#050f18] border border-slate-700 hover:border-[#19F124] transition-colors"
                    >
                        <span className="mb-1 text-[0.65rem] uppercase tracking-wide text-slate-400">
                            Icono
                        </span>
                        <span>{q}</span>
                    </button>
                ))}
                </div>
            )}
            </div>

            <div className="w-[95%] m-auto h-[0.1rem] rounded-full bg-white/10"/>

            <div className="w-full max-w-4xl mx-auto mt-4 shrink-0">
            <form
                onSubmit={handleSend}
                className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#050f18] border border-slate-700"
            >
                <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sendMessageMutation.isPending}
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-500"
                placeholder="Haz la pregunta que quieras…" />
                <button
                type="submit"
                disabled={sendMessageMutation.isPending || !input.trim()}
                className="inline-flex items-center cursor-pointer justify-center w-9 h-9 text-sm font-semibold rounded-full bg-[#19F124] text-[#030c14] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                <FiChevronRight />
                </button>
            </form>
            </div>
            </div>
        </div>
    );
}

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
    return password.length >= 6; // Minimum length for password
};

export const validateRequiredField = (value) => {
    return value.trim() !== '';
};

export const validateDocumentType = (type) => {
    const validTypes = ['PDF', 'DOC', 'DOCX', 'JPEG', 'PNG'];
    return validTypes.includes(type);
};
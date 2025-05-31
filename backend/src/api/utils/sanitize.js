export const sanitizeUserResponse = (user) => {
    const { password, __v, ...safeUser } = user.toObject();
    return safeUser;
};
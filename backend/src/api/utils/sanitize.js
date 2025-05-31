export const sanitizeUserResponse = (user) => {
    const userObj = user && typeof user.toObject === "function" ? user.toObject() : user;
    const { password, __v, ...safeUser } = userObj;
    return safeUser;
};
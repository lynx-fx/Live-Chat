exports.tokenExtractor = (req) => {
    return req.cookies?.auth || null;
}
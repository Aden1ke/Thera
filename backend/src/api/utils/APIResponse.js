class APIResponse {
    static success(res, data = {}, message = 'Request successful', statusCode = 200) {
        return res.status(statusCode).json({
        status: 'success',
        message,
        data
      });
    }
  
    static created(res, message = 'Created Successfully', data) {
        return res.status(200).json({
            status: 'success',
            message,
            data
        });
    }

    static error(res, message = 'Something went wrong', statusCode = 400, errors = null) {
        const response = {
            status: 'error',
            message
        };
    
        if (errors) response.errors = errors;
    
        return res.status(statusCode).json(response);
    }

    static notFound(res, message = 'Resource not found') {
        return res.status(404).json({
            status: 'error',
            message
        });
    }
}
  
export default APIResponse; 
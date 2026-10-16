import { requestLogger } from '../../middleware/logger';
import { Request, Response, NextFunction } from 'express';
import { EventEmitter } from 'events';

describe('Request Logger Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response> & EventEmitter;
  let mockNext: NextFunction;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      originalUrl: '/api/test',
    };
    mockRes = new EventEmitter() as Partial<Response> & EventEmitter;
    mockRes.statusCode = 200;
    mockNext = jest.fn();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve chamar next()', () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('deve logar requisição com status 200', () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);
    mockRes.emit('finish');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/test 200')
    );
  });

  it('deve usar warn para status >= 400', () => {
    mockRes.statusCode = 404;
    requestLogger(mockReq as Request, mockRes as Response, mockNext);
    mockRes.emit('finish');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('404')
    );
  });
});

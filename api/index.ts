import app from '../server';

export default (req: any, res: any) => {
  // Ensure the request URL starts with /api so Express routes it correctly
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
};

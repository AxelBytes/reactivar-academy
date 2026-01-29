// Health check endpoint
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Reactivar Academy API'
  });
}

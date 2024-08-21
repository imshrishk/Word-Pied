export default function handler(req, res) {
    if (req.method === 'POST') {
      // Here you would typically save the data to a database
      // For now, we'll just log it to the console
      console.log(req.body);
      res.status(200).json({ message: 'Data received' });
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
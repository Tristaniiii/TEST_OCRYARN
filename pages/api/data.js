export default (_req, res) => {
    const data = {
      message: 'API data',
      timestamp: new Date().getTime(),
    };
    res.status(200).json(data);
  };
  
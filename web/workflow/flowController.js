
exports.createStatus =  function(req, res) {
  console.log(req.body);
  console.log('yes');
  res.json({'message': 'called'});
};

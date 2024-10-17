exports.handleCustomErrors = (err, req, res, next) => {
    if (err.status && err.msg){
      res.status(err.status).send({"msg" : err.msg})
    }
    else {
      next(err)
    }
  };
  
  exports.handlePSQLErrors = (err, req, res, next) => {
    if(err.code === '22P02'){
      res.status(400).send({msg: "bad request"})
    }
    else if(err.code === '23502'){
      res.status(400).send({msg: "bad request"})
    }
    else if(err.code === '23503'){
      res.status(404).send({msg: "bad request"})
    }
    else if(err.code === '23505'){
      res.status(400).send({msg: "already in database"})
    }
    else if(err.code){
      console.log(err.code, '<<<< google this psql error')
      next(err)
    }
    else {
      next(err)
    }
  };
  
  exports.handleServerErrors = (err, req, res, next) => {
    if(err) {
      console.log(err)
      res.status(500).send({ msg: 'Internal Server Error' })
    }
  };
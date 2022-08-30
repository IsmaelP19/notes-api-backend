const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const namedb = 'phonebook'

const url =
  `mongodb+srv://ismaelp19:${password}@cluster0.6swplbu.mongodb.net/${namedb}?retryWrites=true&w=majority`

mongoose.connect(url)

// we provide the schema for the data we want to store
const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', phonebookSchema)

if(process.argv.length === 3){
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(person.name, person.number)
    } )
    mongoose.connection.close()
  } )
} else if(process.argv.length === 5) {

  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save().then(response => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  } )
}  




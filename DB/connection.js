const mongoose = require('mongoose')

async function main() {
    await mongoose.connect(process.env.MONGO_URI)
    // await mongoose.connect('mongodb://localhost:27017/BangloreTest')
}

main().then(()=>{
    console.log("conecction sucsess");
})
.catch((err)=>{
    console.log(err);
})
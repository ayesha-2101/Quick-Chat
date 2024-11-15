const mongoose=require('mongoose');
const chatSchema=new mongoose.Schema({
    chatName:{
        type:String,
        trim:true
    },
    isCommunity:{
        type:Boolean,
        default:false
    },
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    lastMsg:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Messages"
    },
    gpAdmin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},
{
    timestamps:true
});
module.exports=mongoose.model('Chats',chatSchema);
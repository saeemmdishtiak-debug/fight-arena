const express=require("express");
const http=require("http");
const {Server}=require("socket.io");
const path=require("path");
const app=express(), server=http.createServer(app), io=new Server(server);
const rooms={}; const PORT=process.env.PORT||3000;
app.use(express.static(path.join(__dirname,"public")));
function id(){return Math.random().toString(36).substring(2,7).toUpperCase();}
io.on("connection",s=>{
 s.on("createRoom",()=>{let r=id();while(rooms[r])r=id();rooms[r]={players:{}};s.join(r);rooms[r].players[s.id]=1;s.roomId=r;s.player=1;s.emit("roomCreated",{roomId:r,player:1});});
 s.on("joinRoom",r=>{r=String(r).toUpperCase();if(!rooms[r])return s.emit("joinError","Game room not found.");if(Object.keys(rooms[r].players).length>=2)return s.emit("joinError","Room is full.");s.join(r);rooms[r].players[s.id]=2;s.roomId=r;s.player=2;s.emit("roomJoined",{roomId:r,player:2});io.to(r).emit("gameStart");});
 s.on("playerMove",d=>s.to(s.roomId||"").emit("opponentMove",{player:s.player,x:d.x}));
 s.on("attack",d=>s.to(s.roomId||"").emit("opponentAttack",{player:s.player,type:d.type}));
 s.on("damage",d=>s.to(s.roomId||"").emit("takeDamage",{player:s.player===1?2:1,damage:d.damage}));
 s.on("disconnect",()=>{if(s.roomId&&rooms[s.roomId]){delete rooms[s.roomId].players[s.id];s.to(s.roomId).emit("opponentDisconnected");if(!Object.keys(rooms[s.roomId].players).length)delete rooms[s.roomId];}});
});
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
server.listen(PORT,()=>console.log("Fight Arena running on port "+PORT));
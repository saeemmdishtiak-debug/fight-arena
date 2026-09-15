const socket=io();let me=0,room="",hp=[0,100,100],score=[0,0,0],pos=[0,20,75],keys={};
const $=x=>document.getElementById(x), home=$("home"),wait=$("wait"),game=$("game"),result=$("result");
$("create").onclick=()=>socket.emit("createRoom");$("join").onclick=()=>socket.emit("joinRoom",$("room").value.trim());
socket.on("roomCreated",d=>{me=d.player;room=d.roomId;home.classList.add("hide");wait.classList.remove("hide");$("link").value=location.origin+"/?room="+room});
socket.on("roomJoined",d=>{me=d.player;room=d.roomId;home.classList.add("hide");wait.classList.remove("hide")});
let q=new URLSearchParams(location.search).get("room");if(q)socket.emit("joinRoom",q);
$("copy").onclick=async()=>{await navigator.clipboard.writeText($("link").value);$("copy").textContent="COPIED!"};
socket.on("joinError",x=>alert(x));socket.on("gameStart",()=>{wait.classList.add("hide");game.classList.remove("hide");start()});
function start(){hp=[0,100,100];score=[0,0,0];update();let n=3;$("msg").textContent=n;let c=setInterval(()=>{n--;if(n>0)$("msg").textContent=n;else{$("msg").textContent="FIGHT!";clearInterval(c);setTimeout(()=>$("msg").textContent="",700);timer()}},700)}
function timer(){let t=60;$("time").textContent=t;let x=setInterval(()=>{t--;$("time").textContent=t;if(t<=0){clearInterval(x);winner(hp[1]>=hp[2]?1:2)}},1000)}
document.onkeydown=e=>{keys[e.key.toLowerCase()]=1;let k=e.key.toLowerCase();if(k=="f"||k=="g")attack(k)};
document.onkeyup=e=>keys[e.key.toLowerCase()]=0;
setInterval(()=>{if(!me)return;let k=me==1?["a","d"]:["arrowleft","arrowright"];if(keys[k[0]])pos[me]-=1;if(keys[k[1]])pos[me]+=1;pos[me]=Math.max(me==1?5:55,Math.min(me==1?45:95,pos[me]));move();socket.emit("playerMove",{x:pos[me]})},30);
function move(){$("p1").style.left=pos[1]+"%";$("p2").style.left=pos[2]+"%"}socket.on("opponentMove",d=>{pos[d.player]=d.x;move()});
function attack(k){let ok=me==1?(k=="f"||k=="g"):(k=="k"||k=="l");if(!ok)return;let dmg=(k=="g"||k=="l")?20:10;let pts=dmg==20?25:10;socket.emit("attack",{type:dmg==20?"special":"normal"});socket.emit("damage",{damage:dmg});score[me]+=pts;update()}
socket.on("opponentAttack",d=>{let e=$(d.player==1?"p1":"p2");e.style.transform="scale(1.25)";setTimeout(()=>e.style.transform=d.player==2?"scaleX(-1)":"",180)});
socket.on("takeDamage",d=>{hp[d.player]-=d.damage;update();if(hp[d.player]<=0)winner(d.player==1?2:1)});
function update(){$("h1").style.width=hp[1]+"%";$("h2").style.width=hp[2]+"%";$("s1").textContent="Score: "+score[1];$("s2").textContent="Score: "+score[2]}
function winner(w){game.classList.add("hide");result.classList.remove("hide");$("win").textContent=w==me?"🏆 YOU WIN!":"💥 PLAYER "+w+" WINS!"}
document.querySelectorAll("footer button").forEach(b=>{b.ontouchstart=()=>{let k=b.dataset.k;keys[k]=1;if(k=="f"||k=="g")attack(k)};b.ontouchend=()=>keys[b.dataset.k]=0});
socket.on("opponentDisconnected",()=>{alert("Opponent disconnected");location.href="/"});
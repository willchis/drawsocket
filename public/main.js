let socket;

document.addEventListener("DOMContentLoaded", () => {
   let mouse = { 
      click: false,
      move: false,
      pos: {x:0, y:0},
      pos_prev: false
   };

   // Keep track of people joining, don't re-draw their own lines
   const clientId = Math.random();

   // get canvas element and create context
   let canvas  = document.getElementById('drawing');
   const context = canvas.getContext('2d');
   const width   = window.innerWidth;
   const height  = window.innerHeight;
   socket  = io.connect();

   // set canvas to full browser width/height
   canvas.width = width;
   canvas.height = height;

   // register mouse event handlers
   canvas.onmousedown = (e) => { mouse.click = true; };
   canvas.onmouseup = (e) => { mouse.click = false; };

   canvas.onmousemove = (e) => {
      // normalize mouse position to range 0.0 - 1.0
      mouse.pos.x = e.clientX / width;
      mouse.pos.y = e.clientY / height;
      mouse.move = true;
   };
 
   const drawLine = (data) => {
      if (data.client !== clientId) {
         const line = data.line;
         context.beginPath();
         context.moveTo(line[0].x * width, line[0].y * height);
         context.lineTo(line[1].x * width, line[1].y * height);
         context.stroke();
      }
   };

   // draw line received from server
   socket.on('draw_line', drawLine);

   socket.on('clear_lines', () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
   });

   socket.on("image", function(imageData) {
      let img = new Image();
      img.src = imageData;
      img.onload = function() {
         context.drawImage(img, 0, 0);
       };
    });
   
   // main loop, running every 25ms
   const mainLoop = () => {
      // check if the user is drawing
      if (mouse.click && mouse.move && mouse.pos_prev) {
         // send line to to the server
         const lineData = {
            clientId: clientId,
            line: [ mouse.pos, mouse.pos_prev ]
         };
         drawLine(lineData);
         socket.emit('draw_line', lineData);
         mouse.move = false;
      }
      mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
      setTimeout(mainLoop, 25);
   };
    mainLoop();
});

const refreshPage = () => {
   if (socket) {
      socket.emit('clear_lines');
   }
};

let selectedFile;

const uploadImage = () => {
   if(document.getElementById('FileBox').value != "") {
      const reader = new FileReader();
      reader.onload = (evnt) => {
         socket.emit('image', evnt.target.result);
      }
      reader.readAsDataURL(selectedFile);
   }
   else
   {
      alert("Please select a file.");
   }
};

const fileChosen = (evnt) => {
   selectedFile = evnt.target.files[0];
};
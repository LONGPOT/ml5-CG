let noseX = 0;
let noseY = 0;
let labelName = '';
let eyelX = 0;
let eyelY = 0;

let foods = []; // array to hold food objects
let imgs ;
let video;
// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();
let featureExtractor;

function preload() {
	// let a = Math.random[0,7]
	// img=loadImage(a+".png");
	img=loadImage("0.png");
	// for (let i = 0; i < 7; i++) {
	//   imgs[i] = loadImage('0.png');
  // }
  }

function setup() {
  createCanvas(400, 600);
   // Create a featureExtractor that can extract the already learned features from MobileNet
   featureExtractor = ml5.featureExtractor('MobileNet', MobileNetmodelReady);
   noCanvas();
   // Create a video element
   video = createCapture(VIDEO);
  //  video.hide();
   // Append it to the videoContainer DOM element
   video.parent('videoContainer');
   // Create the UI buttons
   createButtons();
   poseNet = ml5.poseNet(video, poseNetmodelReady);
   poseNet.on('pose', gotPoses);
   
}

function draw() {
  //background(240);
  image(video, 0, 0); 
  fill(255, 0, 0);
  let d = dist(noseX, noseY, eyelX, eyelY);
  ellipse(noseX, noseY, d);
  
  // loop through foods with a for..of loop
  var f = new Food(noseX+100, noseY,d); // Make a new object at the mouse location.
	foods.push(f);
  for (var i = 0; i < foods.length; i++) {
    if(labelName=='Rock'){
      foods[i].display();	
    }else if (labelName == 'Paper') {
      foods[i].update();
  }
}
}

// food class
function Food(tempX, tempY,tempD) {
	this.x = tempX;  // x location of square 
	this.y = tempY;  // y location of square 
  this.speed = 0;  // size
  this.d=tempD;
	
	this.update = function() {
		// Add speed to location
		this.y = this.y + this.speed; 
	
		// Add gravity to speed
		this.speed = this.speed + 0.8; 
	
		// If square reaches the bottom 
		// Reverse speed 
		if (this.y > height) { 
		  this.speed = this.speed * -1;  
		} 

  this.display= function () {
    image(img, this.x, this.y, this.d, this.d);
  };
}
}

function MobileNetmodelReady(){
  select('#status').html('FeatureExtractor(mobileNet model) Loaded')
}

// Add the current frame from the video to the classifier
function addExample(label) {
  const features = featureExtractor.infer(video);
  
  knnClassifier.addExample(features, label);
  updateCounts();
}

// Predict the current frame.
function classify() {
  // Get the total number of labels from knnClassifier
  const numLabels = knnClassifier.getNumLabels();
  if (numLabels <= 0) {
    console.error('There is no examples in any label');
    return;
  }
  const features = featureExtractor.infer(video);
  knnClassifier.classify(features, gotResults);
}

// A util function to create UI buttons
function createButtons() {
  // When the A button is pressed, add the current frame
  // from the video with a label of "rock" to the classifier
  buttonA = select('#addClassRock');
  buttonA.mousePressed(function() {
    addExample('Rock');
  });

  buttonB = select('#addClassPaper');
  buttonB.mousePressed(function() {
    addExample('Paper');
  });

  // Predict button
  buttonPredict = select('#buttonPredict');
  buttonPredict.mousePressed(classify);
}

// Show the results
function gotResults(err, result) {
  // Display any error
  if (err) {
    console.error(err);
  }

  if (result.confidencesByLabel) {
    const confidences = result.confidencesByLabel;
    // result.label is the label that has the highest confidence
    if (result.label) {
      select('#result').html(result.label);
      select('#confidence').html(`${confidences[result.label] * 100} %`);
    }

    select('#confidenceRock').html(`${confidences['Rock'] ? confidences['Rock'] * 100 : 0} %`);
    select('#confidencePaper').html(`${confidences['Paper'] ? confidences['Paper'] * 100 : 0} %`);
    //console.log(result.label);
    labelName=result.label;
    console.log("labelName:"+labelName);
  }

  classify();
}

// Update the example count for each label	
function updateCounts() {
  const counts = knnClassifier.getCountByLabel();

  select('#exampleRock').html(counts['Rock'] || 0);
  select('#examplePaper').html(counts['Paper'] || 0);
  
}

function gotPoses(poses) {
  //console.log(poses);
  if (poses.length > 0) {
    let nX = poses[0].pose.keypoints[0].position.x;
    let nY = poses[0].pose.keypoints[0].position.y;
    let eX = poses[0].pose.keypoints[1].position.x;
    let eY = poses[0].pose.keypoints[1].position.y;
    noseX = lerp(noseX, nX, 0.5);
    noseY = lerp(noseY, nY, 0.5);
    eyelX = lerp(eyelX, eX, 0.5);
    eyelY = lerp(eyelY, eY, 0.5);
  }
}

function poseNetmodelReady() {
  console.log('poseNetmodel ready');
}

/********************************************************
 * constructor
 * @param string canvasDivId 
 * @return MoonOrbitImage 
 */
function MoonOrbitImage (canvasDivId) {

	this.canvas = new InteractiveCanvas(canvasDivId);
	
}

MoonOrbitImage.EARTH_RADIUS = 60;
MoonOrbitImage.MOON_RADIUS = 20;

MoonOrbitImage.prototype.getWidth = function() {
	return this.canvas.getElement().width;
};


MoonOrbitImage.prototype.getHeight = function( ) {
	return this.canvas.getElement().height;
};


/**
 * given an x, y image on this image, determine viewing angle from
 * earth
 * @param x
 * @param y
 */
MoonOrbitImage.prototype.getViewingAngle = function (x, y) {
	
	var dx = x - this.getWidth() / 2;
	var dy = -(y - this.getHeight() / 2);	
	var viewingAngle = Math.atan(dy/dx);
	if (dx < 0)
		return viewingAngle + Math.PI;
	
	return viewingAngle;
};
/**
 * draw orbit image for the given viewing angle
 * @param integer
 */
MoonOrbitImage.prototype.draw = function (viewAngle, hourAngle) {	
	
	var ctx = this.canvas.getContext();
	var earthX = this.getWidth()/2;   
	var earthY = this.getHeight()/2;
	
	
	var orbitRadius = earthY - MoonOrbitImage.MOON_RADIUS;
	var x_offset = orbitRadius * Math.cos(viewAngle);
	var y_offset = -orbitRadius * Math.sin(viewAngle);
	var moonX = earthX + x_offset;
	var moonY = earthY + y_offset;	
	
	// background
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, earthX*2, earthY*2);
	
	// earth
	ctx.fillStyle = "blue";
	ctx.beginPath();
	ctx.arc(earthX, earthY, MoonOrbitImage.EARTH_RADIUS, MoonPhaseAnimation.DAWN, MoonPhaseAnimation.DUSK); 
	ctx.closePath();
	ctx.fill();
	
	ctx.fillStyle = "#99F";
	ctx.beginPath();
	ctx.arc(earthX, earthY, MoonOrbitImage.EARTH_RADIUS, MoonPhaseAnimation.DUSK, MoonPhaseAnimation.DAWN); 
	ctx.closePath();
	ctx.fill();
	
		
	// shadowed half of moon
	ctx.fillStyle = "gray";
	ctx.beginPath();
	ctx.arc(moonX, moonY, MoonOrbitImage.MOON_RADIUS, MoonPhaseAnimation.DAWN, MoonPhaseAnimation.DUSK); 
	ctx.closePath();
	ctx.fill();
	
	//bright half of moon
	ctx.fillStyle = "#CCC";
	ctx.beginPath();
	ctx.arc(moonX, moonY, MoonOrbitImage.MOON_RADIUS, MoonPhaseAnimation.DUSK, MoonPhaseAnimation.DAWN); 
	ctx.closePath();
	ctx.fill();
	
	// tangent to earth (locations where visible from)
	var moonRiseAngle = Math.acos((MoonOrbitImage.EARTH_RADIUS-MoonOrbitImage.MOON_RADIUS)/orbitRadius) + viewAngle;
	var mtanx1 = MoonOrbitImage.MOON_RADIUS * Math.cos(moonRiseAngle);
	var mtany1 = -MoonOrbitImage.MOON_RADIUS * Math.sin(moonRiseAngle);
	var etanx1 = MoonOrbitImage.EARTH_RADIUS * Math.cos(moonRiseAngle);
	var etany1 = -MoonOrbitImage.EARTH_RADIUS * Math.sin(moonRiseAngle);
	
	var moonSetAngle = -Math.acos((MoonOrbitImage.EARTH_RADIUS-MoonOrbitImage.MOON_RADIUS)/orbitRadius) + viewAngle;
	var mtanx2 = MoonOrbitImage.MOON_RADIUS * Math.cos(moonSetAngle);
	var mtany2 = -MoonOrbitImage.MOON_RADIUS * Math.sin(moonSetAngle);
	var etanx2 = MoonOrbitImage.EARTH_RADIUS * Math.cos(moonSetAngle);
	var etany2 = -MoonOrbitImage.EARTH_RADIUS * Math.sin(moonSetAngle);
	
	ctx.strokeStyle = "#550";
	ctx.beginPath();	
	ctx.moveTo(moonX+mtanx1, moonY+mtany1);
	ctx.lineTo(earthX+etanx1, earthY+etany1 );
	
	ctx.moveTo(moonX+mtanx2, moonY+mtany2);
	ctx.lineTo(earthX+etanx2, earthY+etany2);
	ctx.stroke();
	ctx.closePath();
	
		
	// show "hour" of specific location 
	var dotRadius = 2;
	var dotDistance = MoonOrbitImage.EARTH_RADIUS - dotRadius;
	var cx = dotDistance * Math.cos(hourAngle);
	var cy = -dotDistance * Math.sin(hourAngle);
	ctx.fillStyle = "#FF0";
	ctx.beginPath();		
	ctx.arc(earthX + cx, earthY + cy, 2, 0, 2*Math.PI);
	ctx.closePath();
	ctx.fill();
	
	//TODO: tangent to location point -- show visible face from "hour"
	
	return {moonRise: moonSetAngle, moonSet: moonRiseAngle};
	
};
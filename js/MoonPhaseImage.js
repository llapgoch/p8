/********************************************************
 * MoonPhaseImage 
 * @param canvasDivId
 * @returns instance
 */
function MoonPhaseImage(canvasDivId)
{	
	this.canvas = new InteractiveCanvas(canvasDivId);
	this.$canvasElement = $('#' + canvasDivId);

	this.moonImg = null;
	this.isSafariDesktop = this.detectSafariDesktop();
	this.isSafariDesktopOrFireFox = this.detectSafariDesktop() || this.detectFirefox();
	this.ctx = null;
	// Safari borks at first and last quarters otherwise
	this.precipice = this.isSafariDesktop ? 0.01 : 0.00001;
	this.shadowSize = MoonPhaseImage.SHADOW_SIZE;

	// Safari & Firefox do shadows different
	if(this.isSafariDesktopOrFireFox){
		this.shadowSize = MoonPhaseImage.SHADOW_SIZE / 2;
	}
}
MoonPhaseImage.MOON_RADIUS = 350;
MoonPhaseImage.IMAGE_URL = 'moon.png'; 
MoonPhaseImage.SHADOW_OFFSET = 50;
// Safari is funny about the shadow size value with certain curves, beware (33 if all else fails)
MoonPhaseImage.SHADOW_SIZE = 60;
MoonPhaseImage.BRIGHTNESS_LOW = 20;
MoonPhaseImage.BRIGHTNESS_HIGH = 150;



MoonPhaseImage.calculateDecimal = function(start, end, value, flip){
	var range = end - start;
	flip = flip == true ? true : false;
	value = Math.max(start, Math.min(end, value));
	var decimal = (value - start)/range;

	if(flip){
		return 1 - decimal;
	}

	return decimal;
}

MoonPhaseImage.prototype.detectSafari = function(){
	return !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
}

MoonPhaseImage.prototype.detectIos = function(){
	return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

MoonPhaseImage.prototype.detectSafariDesktop = function(){
	return this.detectSafari() &! this.detectIos();
}

MoonPhaseImage.prototype.detectFirefox = function(){
	return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}

/**
 * draw moon phase
 */
MoonPhaseImage.prototype.draw = function(viewAngle, hourAngle, extraAngles) {
	var self = this;

	// load image on-demand
	if (this.moonImg == null) {
		this.moonImg = new Image();
		this.moonImg.onload = function() {			
			self._doDraw( viewAngle, hourAngle, extraAngles );		
		};
		this.moonImg.src = MoonPhaseImage.IMAGE_URL;
	}
	else
		this._doDraw(viewAngle, hourAngle, extraAngles);
};
/**
 * draws a shadow on the moon image as appropriate for how far the moon
 * is as a percent of its lunar cycle
 * @param float
 */
MoonPhaseImage.prototype._doDraw = function (viewAngle, hourAngle, extraAngles) {
	var ctx = this.canvas.getContext();	
	// ctx.save();

	// ctx.restore();

	if(viewAngle > 1.566 && viewAngle <= 1.579){
	//	viewAngle = 1.58;
	}

	var height = this.canvas.getHeight();
	var width = this.canvas.getWidth();
	// ctx.clearRect(0, 0, MoonPhaseImage.MOON_RADIUS, MoonPhaseImage.MOON_RADIUS);
	// ctx.translate(MoonPhaseImage.MOON_RADIUS,MoonPhaseImage.MOON_RADIUS);
    // ctx.rotate( 0.02*Math.PI/180 ); 
    // ctx.translate(-MoonPhaseImage.MOON_RADIUS,-MoonPhaseImage.MOON_RADIUS);
	// how far along through the sky are we?
	var moonY = height/2;
	var moonX = width/2;	
	// the following can be used to animate progress across sky:
	//var moonProgress = (hourAngle-extraAngles.dawn)/(extraAngles.dusk-extraAngles.dawn);
	if(!MoonPhaseImage.doneClip){
		ctx.beginPath();
		ctx.arc(moonX, moonY, MoonPhaseImage.MOON_RADIUS + 1, 0, 2*Math.PI); 
	// ctx.fill();
		ctx.clip();
		MoonPhaseImage.doneClip = true;
	// ctx.save();
	}
	
	// draw background appropriate for time of day
	var hsbRatio = Math.cos( hourAngle );
	var brightness = 0;
	var saturation = 0;	
	if ( hsbRatio > 0) {
		brightness = 0;
		saturation = Math.min( Math.round( 127 * hsbRatio), 40 );
	}
	// ctx.fillStyle = 'rgb(' + brightness + ',' + brightness + ',' + saturation + ')';
	ctx.fillStyle = 'black';
	var result = ctx.fillRect(0,0,width, height);
	
		
	// draw a "horizon line" indicating actual visibility of moon
	var horizonDistance = Math.min( Math.abs(hourAngle-extraAngles.moonRise), Math.abs(hourAngle-extraAngles.moonSet));
	var fadeAngle = 0.3;
	if ( horizonDistance < fadeAngle ) 
	{
		var horizonFadeIntensity = 1.0 - horizonDistance/fadeAngle;
		//removed use of intensity as it was too distracting of an effect
	}
	
	
	// determine side being shadowed (waxing vs waning)
	var isWaxing = false;
	if (viewAngle < Math.PI) {
		isWaxing = true;
	}	

	
	ctx.shadowBlur=this.shadowSize;
	ctx.shadowOffsetX = isWaxing ? MoonPhaseImage.SHADOW_OFFSET : -MoonPhaseImage.SHADOW_OFFSET;
	ctx.shadowColor="black";


	// determine arc influence (gibbous vs cresent)
	var shadowAngle = viewAngle;
	var isGibbous = false;
	if ( MoonPhaseAnimation.DAWN < viewAngle && viewAngle < MoonPhaseAnimation.DUSK ) {
		isGibbous = true;
		shadowAngle = Math.PI - viewAngle;
	}		

	
	
	// determine edge of shadow from current viewing angle			
	var darkAngle = shadowAngle - Math.PI/2; 
	var d_bright =  MoonPhaseImage.MOON_RADIUS * Math.sin(darkAngle);
	var l_bright = MoonPhaseImage.MOON_RADIUS + d_bright;
	var xOffset = 0;

	// determine overlaping shaded circle given edge of shadow
	var l_dark = MoonPhaseImage.MOON_RADIUS - l_bright;
	var l_offset = (Math.pow(MoonPhaseImage.MOON_RADIUS, 2) - Math.pow(l_dark, 2)) / (2 * l_dark);
	var shadow_radius = l_dark + l_offset;
	

	var degreesToRadians = function(deg){
        return deg * 0.0174533;
	};

	var radiansToDegrees = function(rad){
        return rad / 0.0174533;
	};
	var brightness = 100;

		// Calculate X Position offset due to shadow size
	if(viewAngle >= MoonPhaseAnimation.NOON && viewAngle < MoonPhaseAnimation.DAWN){
		xOffset = -(this.shadowSize * MoonPhaseImage.calculateDecimal(MoonPhaseAnimation.NOON, MoonPhaseAnimation.DAWN, viewAngle) / 2)
	}

	if(viewAngle >= MoonPhaseAnimation.DAWN && viewAngle <= MoonPhaseAnimation.MIDNIGHT){
		xOffset = -(this.shadowSize * MoonPhaseImage.calculateDecimal(MoonPhaseAnimation.DAWN, MoonPhaseAnimation.MIDNIGHT, viewAngle, true) / 2)
	}

	if(viewAngle > MoonPhaseAnimation.MIDNIGHT && viewAngle < MoonPhaseAnimation.DUSK){
		xOffset = (this.shadowSize * MoonPhaseImage.calculateDecimal(MoonPhaseAnimation.MIDNIGHT, MoonPhaseAnimation.DUSK, viewAngle, false) / 2)
	}

	if(viewAngle >= MoonPhaseAnimation.DUSK && viewAngle < MoonPhaseAnimation.COMPLETE){
		xOffset = (this.shadowSize * MoonPhaseImage.calculateDecimal(MoonPhaseAnimation.DUSK, MoonPhaseAnimation.COMPLETE, viewAngle, true) / 2)
	}

	if(isWaxing){
		brightness = MoonPhaseImage.calculateDecimal(MoonPhaseAnimation.NOON, MoonPhaseAnimation.MIDNIGHT, viewAngle, false);
	}else{
		brightness = MoonPhaseImage.calculateDecimal(MoonPhaseAnimation.MIDNIGHT, MoonPhaseAnimation.COMPLETE, viewAngle, true);
	}

	var brightnessRange = (MoonPhaseImage.BRIGHTNESS_HIGH - MoonPhaseImage.BRIGHTNESS_LOW);
	//brightness = MoonPhaseImage.BRIGHTNESS_LOW + (brightnessRange * brightness);

	//this.$canvasElement.css('filter', 'brightness(' + brightness + '%)');

	// moon image for moon-phase shading	
	ctx.drawImage(this.moonImg, moonX-MoonPhaseImage.MOON_RADIUS, moonY-MoonPhaseImage.MOON_RADIUS, MoonPhaseImage.MOON_RADIUS*2, MoonPhaseImage.MOON_RADIUS*2);
	
	ctx.fillStyle = 'black';
	//ctx.fillStyle = 'rgba(0,0,0,.75)';
	
	
	// special math case, exactly half full
	if ( Math.abs(viewAngle - MoonPhaseAnimation.DAWN) < this.precipice || Math.abs(viewAngle - MoonPhaseAnimation.DUSK) < this.precipice ) { 		
		if (isWaxing){
			console.log("spec");
			ctx.fillRect(moonX-MoonPhaseImage.MOON_RADIUS*2, moonY-MoonPhaseImage.MOON_RADIUS*2, (MoonPhaseImage.MOON_RADIUS*2)+xOffset, MoonPhaseImage.MOON_RADIUS*4);
			// window.animation.stop();
		}else{
			console.log("spec");
			ctx.fillRect(moonX + xOffset, moonY-MoonPhaseImage.MOON_RADIUS*2, (MoonPhaseImage.MOON_RADIUS*2), MoonPhaseImage.MOON_RADIUS*4);
			// window.animation.stop();
		}
		return;
	}	

	if (isWaxing){
		l_offset = -l_offset;
	}

	
	// draw overlapping shadow circle
	if (isGibbous) {
		var shadowOffset = MoonPhaseImage.SHADOW_OFFSET;
		var lineWidth = 100;
		if(isWaxing){
			shadowOffset = (MoonPhaseImage.SHADOW_OFFSET * MoonPhaseImage.calculateDecimal(2.5, MoonPhaseAnimation.MIDNIGHT, viewAngle, true))
		}else{
			shadowOffset = -(MoonPhaseImage.SHADOW_OFFSET * MoonPhaseImage.calculateDecimal(MoonPhaseAnimation.MIDNIGHT, 3.7, viewAngle, false))
		}
		

		// create a shadow moon
		ctx.fillStyle = 'black';
		ctx.fillRect(moonX-MoonPhaseImage.MOON_RADIUS, moonY-MoonPhaseImage.MOON_RADIUS, MoonPhaseImage.MOON_RADIUS*2, MoonPhaseImage.MOON_RADIUS*2);

		// clip and higlight gibbous region of moon
		ctx.save();		
		
		ctx.beginPath();	

		var xStart = (moonX - l_offset) + xOffset;

		ctx.arc(xStart, moonY, shadow_radius, 0, 2*Math.PI);         
		ctx.clip();
		
		ctx.drawImage(this.moonImg, moonX-MoonPhaseImage.MOON_RADIUS, moonY-MoonPhaseImage.MOON_RADIUS, MoonPhaseImage.MOON_RADIUS*2, MoonPhaseImage.MOON_RADIUS*2);        
		ctx.restore();
		ctx.shadowBlur = this.shadowSize;
		ctx.shadowOffsetX = shadowOffset
		ctx.shadowOffsetY = 0;

		ctx.strokeStyle = "black";
		ctx.beginPath();	
		
		ctx.lineWidth = 100;
		
		ctx.shadowColor="black";	
		// The -1 is for safari, otherwise it goes wrong at certain points
		ctx.arc(Math.floor(xStart), moonY, shadow_radius+(100/2), -1, 2*Math.PI); 
		ctx.stroke();

	
		

	}
	else {	
		// clip and higlight gibbous region of moon			
		ctx.beginPath();		
		ctx.fillStyle = 'black';
		// The -1 is for safari, otherwise it goes wrong at certain points
		ctx.arc(moonX + l_offset + xOffset, moonY, shadow_radius, -1, 2*Math.PI); 
		ctx.fill();	
	}
};




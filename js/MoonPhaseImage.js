/********************************************************
 * MoonPhaseImage 
 * @param canvasDivId
 * @returns instance
 */
function MoonPhaseImage(canvasDivId)
{	
	this.canvas = new InteractiveCanvas(canvasDivId);
	this.moonImg = null;
	this.ctx = null;
}
MoonPhaseImage.MOON_RADIUS = 200;
MoonPhaseImage.IMAGE_URL = 'moon.png'; 
MoonPhaseImage.SHADOW_OFFSET = 50;
MoonPhaseImage.SHADOW_SIZE = 60;


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
	var height = this.canvas.getHeight();
	var width = this.canvas.getWidth();

	// how far along through the sky are we?
	var moonY = height/2;
	var moonX = width/2;	
	// the following can be used to animate progress across sky:
	//var moonProgress = (hourAngle-extraAngles.dawn)/(extraAngles.dusk-extraAngles.dawn);
	
	
	// draw background appropriate for time of day
	var hsbRatio = Math.cos( hourAngle );
	var brightness = 0;
	var saturation = 0;	
	if ( hsbRatio > 0) {
		brightness = 0;
		saturation = Math.min( Math.round( 127 * hsbRatio), 40 );
	}
	//ctx.fillStyle = 'rgb(' + brightness + ',' + brightness + ',' + saturation + ')';
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

	
	ctx.shadowBlur=MoonPhaseImage.SHADOW_SIZE;
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

	// moon image for moon-phase shading	
	ctx.drawImage(this.moonImg, moonX-MoonPhaseImage.MOON_RADIUS, moonY-MoonPhaseImage.MOON_RADIUS, MoonPhaseImage.MOON_RADIUS*2, MoonPhaseImage.MOON_RADIUS*2);
	
	ctx.fillStyle = 'black';//'rgba(' + brightness + ',' + brightness + ',' + saturation + ', 0.75)';
	//ctx.fillStyle = 'rgba(0,0,0,.75)';
	
	// special math case, exactly half full
	if ( Math.abs(viewAngle - MoonPhaseAnimation.DAWN) < 0.00001 || Math.abs(viewAngle - MoonPhaseAnimation.DUSK) < 0.00001 ) { 		
		if (isWaxing){
			console.log("WAXING");
			ctx.fillRect(moonX-MoonPhaseImage.MOON_RADIUS*2, moonY-MoonPhaseImage.MOON_RADIUS*2, (MoonPhaseImage.MOON_RADIUS*2)-MoonPhaseImage.SHADOW_SIZE, MoonPhaseImage.MOON_RADIUS*4);
		}else{
			console.log("WANING");
		
			ctx.fillRect(moonX, moonY-MoonPhaseImage.MOON_RADIUS*2, MoonPhaseImage.MOON_RADIUS*2, MoonPhaseImage.MOON_RADIUS*4);
		
		}
		return;
	}	

	

	
	if (isWaxing)
		l_offset = -l_offset;
	
	// draw overlapping shadow circle
	if (isGibbous) {


		// create a shadow moon
		ctx.fillStyle = 'black';
		ctx.fillRect(moonX-MoonPhaseImage.MOON_RADIUS, moonY-MoonPhaseImage.MOON_RADIUS, MoonPhaseImage.MOON_RADIUS*2, MoonPhaseImage.MOON_RADIUS*2);

		// clip and higlight gibbous region of moon
		ctx.save();		
		
		ctx.beginPath();	


		ctx.arc(moonX - l_offset, moonY, shadow_radius+10, 0, 2*Math.PI);         
		ctx.clip();
		
		ctx.drawImage(this.moonImg, moonX-MoonPhaseImage.MOON_RADIUS, moonY-MoonPhaseImage.MOON_RADIUS, MoonPhaseImage.MOON_RADIUS*2, MoonPhaseImage.MOON_RADIUS*2);        
		ctx.strokeStyle = "black";
		ctx.beginPath();	
		ctx.shadowBlur=MoonPhaseImage.SHADOW_SIZE;
		ctx.shadowOffsetX = isWaxing ? MoonPhaseImage.SHADOW_OFFSET : -MoonPhaseImage.SHADOW_OFFSET;
		ctx.lineWidth = 100;
		ctx.shadowOffsetY = 0;
		ctx.shadowColor="black";	
		ctx.arc(moonX - l_offset, moonY, shadow_radius+(100/2), 0, 2*Math.PI); 
		ctx.stroke();
	


		ctx.restore();

	}
	else {	
		console.log(l_offset);
		// clip and higlight gibbous region of moon			
		ctx.beginPath();		
		ctx.fillStyle = 'black';
		ctx.arc(moonX + l_offset, moonY, shadow_radius, 0, 2*Math.PI); 
		ctx.fill();	
	}
		

	
};




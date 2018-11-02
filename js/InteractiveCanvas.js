
/**
 * constructor
 * General utility for more heafty, interactive work with canvases
 * @param canvasId
 * @returns
 */
function InteractiveCanvas(canvasId) {
	
    this.canvasId = canvasId;	
	
    this.dragOrigin = null;
    this._context = null;
    this._canvas = null;
    
}
/**
 * DEPRECATED
 * @see getPoint(x,y).getData()
 */
InteractiveCanvas.prototype.getPointData = function(x,y) {
	var imgData = this.getContext().getImageData(x,y,1,1);
	return {r: imgData.data[0], g:imgData.data[1], b:imgData.data[2], a:imgData.data[3]};
};
/**
 * get canvas height
 * @returns
 */
InteractiveCanvas.prototype.getHeight = function() {
	return this.getElement().height;
};
/**
 * get canvas width
 * @returns
 */
InteractiveCanvas.prototype.getWidth = function() {
	return this.getElement().width;
};
/**
 * get center or pivot point of canvas
 * @returns
 */
InteractiveCanvas.prototype.getCenter = function() {
	return this.getPoint( this.getWidth()/2, this.getHeight()/2);
};

/**
 * executes the given function if the user clicks on the canvas
 * @param function(x, y)  -- passes off where click occurred in _canvas_ coordinates
 */
InteractiveCanvas.prototype.addDblClickListener = function(f) {
	var self = this;
	
	var canvas = this.getElement();
	canvas.addEventListener('dblclick', function(e) {		
		var mouse = self.getMouse(e);	    
	    f(mouse.x, mouse.y);
	});
};

/**
 * executes given function if user is dragging the mouse
 * 
 * @param function({Point})
 */
InteractiveCanvas.prototype.addDragListener = function(f, terminator) {
	
	var canvas= this.getElement();
	var self = this;
	canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false); //fixes a problem where double clicking causes text to get selected on the canvas    
	canvas.addEventListener('mousedown', function(e) {		
		self.dragOrigin = self.getMouse(e);
	});
	
	canvas.addEventListener('mouseup', function(e) {
			if (terminator !== undefined && terminator != null) {
	    		var mouse = self.getMouse(e);
	    		terminator(mouse);
	    	}
	    	self.dragOrigin = null;	    	
	  	}, true);
	
	canvas.addEventListener('mousemove', function(e) {
		    if (self.dragOrigin == null) 
		    	return;
	    	var mouse = self.getMouse(e);	    	
		    f(mouse);		    
		}, true);
};


/**
 * get the graphics context (2d)
 */
InteractiveCanvas.prototype.getContext = function() {
    			
	var drawingCanvas = this.getElement();
	if (this._context == null && drawingCanvas.getContext) {			
		this._context = drawingCanvas.getContext('2d');			
	}
	return this._context;
};


/**
 * get the canvas element
 * @returns element
 */
InteractiveCanvas.prototype.getElement = function() {
	var canvas = document.getElementById(this.canvasId);
	// if we are finally ready to use canvas, also grab some related information
	if (this.stylePaddingLeft === undefined) {
		if (document.defaultView && document.defaultView.getComputedStyle) {
		    this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
		    this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
		    this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
		    this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
		}
		var html = document.body.parentNode;
	    this.htmlTop = html.offsetTop;
		this.htmlLeft = html.offsetLeft;
	}
	return canvas;
};

/**
 * 
 * @param e event
 * @returns {Point}
 */
InteractiveCanvas.prototype.getMouse = function(e) {
	  
	  var canvas = this.getElement(); 
	  var offsetX = 0;
	  var offsetY = 0;
	 
	  // Compute the total offset
	  var element = canvas;
	  if (element.offsetParent !== undefined) {
	    do {
	      offsetX += element.offsetLeft;
	      offsetY += element.offsetTop;
	    } while ((element = element.offsetParent));
	  }
	 
	  // Add padding and border style widths to offset
	  // Also add the <html> offsets in case there's a position:fixed bar
	  offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
	  offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;
	 
	  var mx = e.pageX - offsetX;
	  var my = e.pageY - offsetY;
	 
	  // We return a simple javascript object (a hash) with x and y defined
	  return this.getPoint(mx, my);
};
/**
 * get point info 
 * @param x
 * @param y
 * @returns {Point}
 */
InteractiveCanvas.prototype.getPoint = function(x, y)
{	
	return new Point(this, x, y, null, null);
};
/**
 * get Point via polar coordinates
 * @param radius
 * @param angle
 * @returns {Point}
 */
InteractiveCanvas.prototype.getPolar = function(radius, angle)
{
	var center = this.getCenter();
	var x = center.x + radius*Math.cos(angle);
	var y = center.y + radius*Math.sin(angle);
	return new Point(this, x, y, radius, angle);
};

/**
 * a point on the canvas 
 * constructor 
 * @see InteractiveCanvas.getPoint and getPolar
 * @param x
 * @param y
 * @returns Point
 */
function Point(canvas, x, y, radius, angle)
{
	this.canvas = canvas;
	this.x = x;
	this.y = y;
	this.radius = radius;
	this.angle = angle;		
}
/**
 * get canvas element data
 * @returns {___anonymous4763_4839}
 */
Point.prototype.getData = function()
{
	var imgData = this.canvas.getContext().getImageData(this.x, this.y, 1, 1);
	return {r: imgData.data[0], g:imgData.data[1], b:imgData.data[2], a:imgData.data[3] };
};
/**
 * get radius
 * @returns
 */
Point.prototype.getRadius = function()
{		
	return this.radius;
};
/**
 * get angle
 * @returns
 */
Point.prototype.getAngle = function()
{
	//alternate definition of point, of interest to rotating environments
	if (this.angle == null)
	{
		var center = this.canvas.getCenter();
		var dx = this.x - center.x;
		var dy = this.y - center.y;		
		this.angle = Math.atan(dy/dx);
		if (dx < 0)
			this.angle = this.angle + Math.PI;
	}	
	return this.angle;
};


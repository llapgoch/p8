
/********************************************************
 * controls syncronized animation of a lunar orbit
 * @returns
 */
function MoonPhaseAnimation(moonDivId, orbitDivId) {

    this.viewingAngle = 3.14;
    this.hourAngle = Math.PI;
    this.speed = 30;

    this.moonImage = new MoonPhaseImage(moonDivId);
    this.orbitImage = new MoonOrbitImage(orbitDivId);

    var self = this;
    this.orbitImage.canvas.addDblClickListener(function(x, y) {
        self.alignToPoint(x, y);
    });
    this.orbitImage.canvas.addDragListener(function(x, y) {
        self.alignToPoint(x, y);
    });

}

MoonPhaseAnimation.CYCLE_DAYS = 29.53;    //days from one new moon to next 
MoonPhaseAnimation.CYCLE_HOURS = MoonPhaseAnimation.CYCLE_DAYS * 24.0; //hours from one new moon to the next
MoonPhaseAnimation.MIDNIGHT = Math.PI;
MoonPhaseAnimation.NOON = 0.0;
MoonPhaseAnimation.DAWN = Math.PI * 1 / 2;
MoonPhaseAnimation.DUSK = Math.PI * 3 / 2;
MoonPhaseAnimation.COMPLETE = Math.PI * 2;


/**
 * for debugging, determine degree equivalent to given radians
 * @param radians
 * @returns {Number}
 */
MoonPhaseAnimation.getDegrees = function(radians) {
    return (radians * 180.0 / Math.PI) % 360.0;
};
/**
 * determine 0-2pi equivalent for any given angle (float-safe)
 * @param angle
 * @returns
 */
MoonPhaseAnimation.standardizeAngle = function(angle) {
    while (angle >= 2 * Math.PI)
        angle -= 2 * Math.PI;
    while (angle < 0)
        angle += 2 * Math.PI;
    return angle;
};

/**
 * repaint any graphics associated with this animation
 */
MoonPhaseAnimation.prototype.draw = function() {
    var angles = this.orbitImage.draw(this.viewingAngle, this.hourAngle);
    this.moonImage.draw(this.viewingAngle, this.hourAngle, angles);

};

/**
 * start animation 
 */
MoonPhaseAnimation.prototype.start = function() {

    if (this.animationProcessID != null)
        return; //already started

    var self = this;
    this.animationProcessID = setInterval(function() {
        self.incrementHour();
        self.draw();

    }, this.speed);
};
/**
 * a drag-motivated animation rather than a timer motivated one
 * @param e (Point)
 */
MoonPhaseAnimation.prototype.alignToPoint = function(p) {

    var canvas = this.orbitImage.canvas;
    var pointData = p.getData();
    var angle = this.orbitImage.getViewingAngle(p.x, p.y);
    if (pointData.b == 255) { // something blue, probably earth!
        this.setHourAngle(angle);
    }
    else {
        this.setViewingAngle(angle);
    }
    this.draw();

};

/**
 * stop animation
 */
MoonPhaseAnimation.prototype.stop = function() {
    clearInterval(this.animationProcessID);
    this.animationProcessID = null;
};
/**
 * set the cycle location (does not redraw automatically)
 * @param phase float
 */
MoonPhaseAnimation.prototype.setLunarDay = function(day) {
    this.setViewingAngle(day / MoonPhaseAnimation.CYCLE_DAYS * 2 * Math.PI);
};
/**
 * track an "hour" as a fixed rotation point on the earth. Noon is strait facing the
 * light source, midnight is in middle of dark region
 * @param float hour
 */
MoonPhaseAnimation.prototype.setTerranHour = function(hour) {
    this.setHourAngle(2 * Math.PI * hour / 24.0 - Math.PI);
};


/**
 * increment the whole animation by one hour
 */
MoonPhaseAnimation.prototype.incrementHour = function() {

    var hourPerIncrement = 0.35;
    var nextTerranHour = this.hourAngle + hourPerIncrement / 24.0 * 2 * Math.PI;
    this.setHourAngle(nextTerranHour);

    var nextLunarHour = this.viewingAngle + hourPerIncrement / MoonPhaseAnimation.CYCLE_HOURS * 2 * Math.PI;
    this.setViewingAngle(nextLunarHour);
};

/**
 * set the angle the hour of the viewing location is in
 * @param hourAngle
 */
MoonPhaseAnimation.prototype.setHourAngle = function(hourAngle) {
    this.hourAngle = MoonPhaseAnimation.standardizeAngle(hourAngle);
};
/**
 * set the angle the moon is at relative to the earth
 * @param angle
 */
MoonPhaseAnimation.prototype.setViewingAngle = function(angle) {

    this.viewingAngle = MoonPhaseAnimation.standardizeAngle(angle);

};


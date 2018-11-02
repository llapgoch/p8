jQuery.widget('phase8.moon', {
    options: {
        stageWidth: 800,
        stageHeight: 800,
        updateInterval: 100,
        growIncrement: 0.01,
        moveIncrement: 0.4
    },
    
    canvas: null,
    ctx: null,
    updateInt: null,
    maskX:null,

    
    _create: function(){
        var canvas =  $('<canvas />', {
            width: this.options.stageWidth,
            height: this.options.stageHeight
        });
        
        this.canvas = canvas.get(0);
        this.canvas.width = this.options.stageWidth;
        this.canvas.height = this.options.stageHeight;
        this.maskX = this.options.stageWidth/2;
        this.maskSize = this.options.stageHeight/2-20;

        this.ctx = this.canvas.getContext('2d');
        
        this.element.append(canvas);
        this._start();
    },
    
    degreesToRadians: function(deg){
        return deg * 0.0174533;
    },
    
    _rotatePoint: function($pPoint, $pOrigin, rot){
        var $rp = {};
        var radians = (rot / 180) * Math.PI;

        $rp['x'] = $pOrigin['x'] + (Math.cos(radians) * ($pPoint['x'] - $pOrigin['x']) - Math.sin(radians) * ($pPoint['y'] - $pOrigin['y']));
        $rp['y'] = $pOrigin['y'] + (Math.sin(radians) * ($pPoint['x'] - $pOrigin['x']) + Math.cos(radians) * ($pPoint['y'] - $pOrigin['y']));

        return $rp;
    },

    _start: function(){
        var self = this;
        
        this._stop();
        
        this.updateInt = window.setInterval(function(){
            self.update();
        }, this.options.updateInterval);
    },

    _stop: function(){
        if(this.updateInt){
            window.clearInterval(this.updateInt);
        }
    },

    _drawShadow: function(){
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(this.options.stageWidth/2,this.options.stageHeight/2,this.options.stageHeight/2-20,0*Math.PI,2*Math.PI);
        this.ctx.fill();
        this.ctx.endPath();
    },

    _clearStage: function(){
        this.ctx.clearRect(0, 0, this.options.stageWidth, this.options.stageHeight);
    },

    update: function(){
        this._clearStage();
        this._drawShadow();
        this.ctx.fillStyle = 'red';
        this.ctx.beginPath();
        this.ctx.arc(this.maskX,this.options.stageHeight/2,this.maskSize,0*Math.PI,2*Math.PI);
        this.ctx.fill();
        this.ctx.scale(1+this.options.growIncrement, 1);
        this.maskX -= (this.options.moveIncrement + this.options.growIncrement);
        this.options.growIncrement += 0.01;
    }
    
});
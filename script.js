var emojiRhythm = {
    // settings
    setting: {
        // style
        size: {
            width: 465,
            height: 465
            // height: window.innerHeight > 465 ? window.innerHeight : 465
        },
        emojiText: {
            me : {
                run_0: '     (*´о`)。゜',
                run_1: 'ヾ(´∇｀)ノﾞ',
                run_2: '…(｀@▽@´ﾞ)…',
                crash: '   つД｀)･ﾟ'
            },
            enemy: {
                0: '(；￢＿￢)',
                1: '(´-д-)-3',
                2: '(*ﾟДﾟ)'
            },
            friend: {
                0: '(* \'ω\')ﾉ',
                1: 'Σ(ﾟεﾟ)ﾉ',
                2: '(*´∀｀*)'
            }
        },
        emojiSize: {
            width: 50,
            height: 30
        },
        mePosition: {
            bottom: 80 
        },
        tailCount: 7,
        tailSaturation: {
            off: 0.5,
            on: 1
        },
        rhythmBorderWidth: 10,
        characterStyle: {
            font: 'sans-serif',
            fontSize: 20,
            strokeWidth: 1,
            strokeColor: '#FFFFFF',
            fillColor: '#FFFFFF'
        },
        // play
        musicRhythm: 0.423,
        rhythmRange: [0.1, 0.6],
        meSpeed: 0.1,
        othersInterval: 300,
        friendRate: 0.2,
        recoverCost: 3,
        crashTime: 2000,
        speed: {
            min: 7,
            crash: 4,
            hit: 0.2,
            miss: 0.2,
            slower: 0.005
        },
        scorePow: 5,
        scoreFriend: 500,
        playTime: 100,
        rhythmKey: 'f'
    },
    // ---
    layers: {},
    init: function() {
        this.music = document.getElementById('bgm');

        this.emojiMinPointX = this.setting.emojiSize.width / 2 + this.setting.rhythmBorderWidth;
        this.emojiMaxPointX = this.setting.size.width - this.emojiMinPointX;

        this.canvasDom = document.getElementById('canvas');
        this.canvasDom.style.height = this.setting.size.height + 'px';
        this.canvasDom.style.marginTop = (- this.setting.size.height / 2) + 'px';

        paper.install(window);
        paper.setup(this.canvasDom);

        this.startup();
    },
    _tools: {
        detachEvent: function(who, events) {
            if(!who._handlers) return;
            for(var i in events) {
                if(who._handlers[events[i]]) who._handlers[events[i]] = undefined;
            }
        },
        toLayer: function(layerName) {
            var self = emojiRhythm;
            self._tools.detachEvent(view, ['frame', 'resize']);
            self._tools.detachEvent(tool, ['mousedown', 'mouseup', 'mousedrag', 'mousemove', 'keydown', 'keyup']);
            if(project.activeLayer) project.activeLayer.remove();
            return new Layer();
        },
        rhythm: function(time, zoom) {
            var self = emojiRhythm;
            return Math.abs((zoom * time / self.setting.musicRhythm) % 1 - 0.5) * 2;
        }
    },
    startup: function() {
        var self = emojiRhythm;
        self._tools.toLayer('startup');

        // music loading
        var $musicLoading = new PointText([self.setting.size.width / 2, self.setting.size.height / 2]);
        $musicLoading.name = 'musicLoading';
        $musicLoading.content = 'LOADING MUSIC...';
        $musicLoading.characterStyle = self.setting.characterStyle;
        $musicLoading.paragraphStyle = { justification: 'center' };

        view.attach('frame', function(e) {
            var self = emojiRhythm;
            if(self.music.readyState === 4) musicLoaded();
            if(!$musicLoading) return;

            var rate = 0.995 + self._tools.rhythm(e.time, 0.2) / 100;
            $musicLoading.scale(rate);
        });

        function musicLoaded() {
            $musicLoading.remove();
            $musicLoading = null;

            // help
            var helpText = [
                "リズムに合わせて、\n「F」キーを押せば加速して、得点が高い。",
                "白い絵文字を避けながら、\n色のある絵文字をキャッチできれば得点する。",
                "タイムリミットは" + self.setting.playTime + "秒、",
                "\n\n音量を大きくして、ゲーム・スタート！"
            ];
            var $help = new PointText([self.setting.size.width / 2, self.setting.size.height / 2 + 100]);
            $help.name = 'help';
            $help.step = 0;
            $help.content = helpText[$help.step];
            $help.characterStyle = self.setting.characterStyle;
            $help.paragraphStyle = { justification: 'center' };

            var $helpImage = new Raster('help_' + $help.step);
            $helpImage.position = view.center;
            project.activeLayer.insertChild(0, $helpImage);

            tool.attach('mousedown', function(e) {
                var self = emojiRhythm;

                $help.step++;

                if($help.step < helpText.length) {
                    $helpImage.remove();
                    $helpImage = new Raster('help_' + $help.step);
                    $helpImage.position = view.center;
                    project.activeLayer.insertChild(0, $helpImage);

                    $help.content = helpText[$help.step];
                }
                else {
                    self.play();
                }
            });
        }
    },
    finish: function() {
        var self = emojiRhythm;
        self._tools.toLayer('finish');

        self.music.pause();
        self.music.currentTime = 0;

        var $score = new PointText([self.setting.size.width / 2, self.setting.size.height / 2 - 50]);
        $score.name = 'score';
        $score.content = "SCORE\n" + self.playStatus.score;
        $score.characterStyle = self.setting.characterStyle;
        $score.paragraphStyle = { justification: 'center' };
        $score.fontSize = 50;

        var $highSpeed = new PointText([self.setting.size.width / 2, self.setting.size.height / 2 + 50]);
        $highSpeed.name = 'highSpeed';
        $highSpeed.content = 'HIGH SPEED: ' + Math.round(self.playStatus.highSpeed * 100) / 100 + ' km/h';
        $highSpeed.characterStyle = self.setting.characterStyle;
        $highSpeed.paragraphStyle = { justification: 'center' };
    },
    play: function() {
        var self = emojiRhythm;
        self._tools.toLayer('play');

        // play status
        if(self.playStatus && self.playStatus.crashTimeout) {
            clearTimeout(self.playStatus.crashTimeout);
        }
        self.playStatus = {
            speed: self.setting.speed.min,
            highSpeed: 0,
            onCrash: false,
            crashTimeout: null,
            score: 0
        };

        // rhythm rectangle
        var $rhythmRectangle = new Path.Rectangle([0, 0], [self.setting.size.width, self.setting.size.height]);
        $rhythmRectangle.name = 'rhythmRectangle';
        $rhythmRectangle.strokeWidth = self.setting.rhythmBorderWidth * 2;
        $rhythmRectangle.strokeColor = '#FFFFFF';

        // me
        var $me = new Group();
        $me.name = 'me';
        // - text
        var $me_text = new PointText([self.setting.size.width / 2, self.setting.size.height - self.setting.mePosition.bottom]);
        $me_text.name = 'text';
        $me_text.content = self.setting.emojiText.me.run_0;
        $me_text.characterStyle = self.setting.characterStyle;
        $me_text.paragraphStyle = { justification: 'center' };
        $me.addChild($me_text);
        // - tails
        var $me_tails = new Group();
        $me_tails.name = 'tails';
        var tailWidth = self.setting.emojiSize.width / self.setting.tailCount;
        var tailColors = [];
        for(var i = 0; i < self.setting.tailCount; i++) {
            tailColors.push(new HSBColor(i * 360 / self.setting.tailCount, 1, 1));
        }
        for(var i in tailColors) {
            var $_tail = new Path();
            $_tail.fillColor = tailColors[i];
            $_tail.fillColor.saturation = self.setting.tailSaturation.off;
            $me_tails.addChild($_tail);
        }
        $me.insertChild(0, $me_tails);
        // - add to layer
        project.activeLayer.insertChild(0, $me);

        // others
        var $others = new Group();
        $others.name = 'others';
        project.activeLayer.insertChild(0, $others);

        // score
        var $score = new PointText([20, 35]);
        $score.name = 'score';
        $score.content = self.playStatus.score;
        $score.characterStyle = self.setting.characterStyle;
        project.activeLayer.addChild($score);

        // speed
        var $speed = new Group();
        $speed.name = 'speed';

        var $speed_unit = new PointText([self.setting.size.width - 20, 35]);
        $speed_unit.name = 'unit';
        $speed_unit.content = ' km/h';
        $speed_unit.characterStyle = self.setting.characterStyle;
        $speed_unit.paragraphStyle = { justification: 'right' };
        $speed.addChild($speed_unit);

        var $speed_now = new PointText([self.setting.size.width - 20 - $speed_unit.bounds.width, 35]);
        $speed_now.name = 'now';
        $speed_now.content = 0;
        $speed_now.characterStyle = self.setting.characterStyle;
        $speed_now.paragraphStyle = { justification: 'right' };
        $speed.addChild($speed_now);

        project.activeLayer.addChild($speed);

        // music
        self.music.pause();
        self.music.currentTime = 0;
        self.music.play();

        // events
        tool.attach('keydown', function(e) {
            var self = emojiRhythm;

            if(self.playStatus.onCrash) return;
            if(e.key != self.setting.rhythmKey) return;

            var rhythm = self._tools.rhythm(self.music.currentTime, 1);
            console.log(rhythm);
            if(self.setting.rhythmRange[0] < rhythm && rhythm < self.setting.rhythmRange[1]) {
                self.playStatus.speed += self.setting.speed.hit;
            }
            else {
                self.playStatus.speed -= self.setting.speed.miss;
            }
            if(self.playStatus.speed < self.setting.speed.min) self.playStatus.speed = self.setting.speed.min;
        });

        tool.attach('mousemove', function(e) {
            self.mousePoint = e.point;
        });

        view.attach('frame', function(e) {
            var self = emojiRhythm;

            // started
            if(self.music.paused) return;

            // finish
            if(self.music.currentTime >= self.setting.playTime) {
                self.finish();
                return;
            }

            // rhythm rectangle
            var rhythm_1 = self._tools.rhythm(self.music.currentTime, 1);
            $rhythmRectangle.strokeColor.blue = rhythm_1;
            $rhythmRectangle.strokeColor.green = rhythm_1 / 2 + 0.5;

            // me
            // - text
            var $me_text = $me.children['text'];
            $me_text.matrix.scaleX = $me_text.matrix.scaleY = 0.875 + rhythm_1 / 4;
            if(self.mousePoint) {
                var textXDelta = (self.mousePoint.x - $me_text.position.x) * self.setting.meSpeed;
                if(Math.abs(textXDelta) > 0.1) $me_text.position.x += textXDelta;
                if($me_text.position.x < self.emojiMinPointX) $me_text.position.x = self.emojiMinPointX;
                if($me_text.position.x > self.emojiMaxPointX) $me_text.position.x = self.emojiMaxPointX;
            }
            // - tails
            for (var i in $me_tails.children) {
                var $_tail = $me_tails.children[i];
                $_tail.translate([0, 20]);
                var y = $me_text.position.y + $me_text.bounds.height / 2;
                var left = $me_text.position.x + (i - self.setting.tailCount / 2) * tailWidth;
                var right = left + tailWidth;
                $_tail.add([left, y]);
                $_tail.insert(0, [right, y]);
                if($_tail.segments.length > 100) {
                    var i = Math.round($_tail.segments.length / 2);
                    $_tail.segments[i].remove();
                    $_tail.segments[i - 1].remove();
                }
                $_tail.scale(0.85 + rhythm_1 / 8, $me_text.position);
                $_tail.smooth();
            }

            // others
            var maxCount = 10;
            // - generate
            if(e.count % Math.ceil(self.setting.othersInterval / self.playStatus.speed) === 1) {
                var isFriend = Math.random() < self.setting.friendRate;
                var randomEmojiText = Math.floor(Math.random() * 3);
                var randomColor = Math.floor(Math.random() * self.setting.tailCount);
                var color = isFriend ? tailColors[randomColor] : self.setting.characterStyle.fillColor;
                var randomX = Math.random() * (self.setting.size.width - self.setting.emojiSize.width) + self.setting.emojiSize.width / 2;
                var $_text = new PointText([randomX, - self.setting.emojiSize.height / 2]);
                $_text.isFriend = isFriend;
                $_text.friendColorIndex = randomColor;
                $_text.content = self.setting.emojiText[isFriend ? 'friend' : 'enemy'][randomEmojiText];
                $_text.characterStyle = self.setting.characterStyle;
                $_text.characterStyle.fontSize = 12;
                $_text.characterStyle.fillColor = color;
                $_text.characterStyle.strokeColor = color;
                $_text.paragraphStyle = { justification: 'center' };
                $others.addChild($_text);
            }
            // - move
            for(var i = $others.children.length - 1; i >= 0 && i >= $others.children.length - maxCount; i--) {
                var $_text = $others.children[i];
                $_text.translate([0, self.playStatus.speed]);
                $_text.matrix.scaleX = $_text.matrix.scaleY = 0.875 + rhythm_1 / 4;
            }
            // - delete
            if($others.children.length > maxCount) {
                for(var i = 0; i < $others.children.length - maxCount; i++) {
                    $others.children[i].remove();
                }
            }
            // - hit detact
            var meBounds = $me.children['text'].bounds.clone();
            meBounds.left = meBounds.center.x - self.setting.emojiSize.width / 2;
            meBounds.right = meBounds.center.x + self.setting.emojiSize.width / 2;
            for(var i = $others.children.length - 1; i >= 0 && i >= $others.children.length - maxCount; i--) {
                var $_text = $others.children[i];
                if($_text.position.y < meBounds.top || $_text.position.y > meBounds.bottom) continue;
                if($_text.position.x < meBounds.left || $_text.position.x > meBounds.right) continue;
                var isFriend = $_text.isFriend;
                if(!isFriend) {
                    var recoverCount = 0;
                    for(var i = 0; i < $me_tails.children.length; i++) {
                        var $_tail = $me_tails.children[i];
                        if($_tail.fillColor.saturation === self.setting.tailSaturation.on) {
                            $_tail.fillColor.saturation = self.setting.tailSaturation.off;
                            recoverCount++;
                            if(recoverCount >= self.setting.recoverCost) break;
                        }
                    }
                    if(recoverCount < self.setting.recoverCost) {
                        self.playStatus.onCrash = true;
                        self.playStatus.speed = self.setting.speed.crash;
                        $me_text.content = self.setting.emojiText.me.crash;
                        if(self.playStatus.crashTimeout) clearTimeout(self.playStatus.crashTimeout);
                        self.playStatus.crashTimeout = setTimeout(function(){
                            self.playStatus.onCrash = false;
                            self.playStatus.speed = self.setting.speed.min;
                            $me_text.content = self.setting.emojiText.me.run_0;
                        }, self.setting.crashTime);
                    }
                }
                else {
                    $me_tails.children[$_text.friendColorIndex].fillColor.saturation = self.setting.tailSaturation.on;
                    self.playStatus.score += self.setting.scoreFriend;
                }
                $_text.remove();
                break;
            }

            // score
            self.playStatus.score += Math.floor(Math.pow(self.playStatus.speed / 7, self.setting.scorePow));
            $score.content = self.playStatus.score;

            // speed
            if(! self.playStatus.onCrash) {
                self.playStatus.speed -= self.setting.speed.slower;
                if(self.playStatus.speed < self.setting.speed.min) self.playStatus.speed = self.setting.speed.min;
            }
            if(! self.playStatus.onCrash) {
                if(self.playStatus.speed < 8) $me_text.content = self.setting.emojiText.me.run_0;
                else if(self.playStatus.speed < 10) $me_text.content = self.setting.emojiText.me.run_1;
                else $me_text.content = self.setting.emojiText.me.run_2;
            }
            if(self.playStatus.speed > self.playStatus.highSpeed) self.playStatus.highSpeed = self.playStatus.speed;
            $speed_now.content = Math.round(self.playStatus.speed * 100) / 100;
        });
    }
};

(function() {
    emojiRhythm.init();
})();

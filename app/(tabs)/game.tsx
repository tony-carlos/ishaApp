import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, Dimensions, Alert } from 'react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import { Play, CirclePause as PauseCircle, RotateCcw, Trophy, CircleHelp as HelpCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAME_WIDTH = SCREEN_WIDTH - 48;
const BUBBLE_SIZE = 60;

// Game objects
interface Bubble {
  id: string;
  type: 'cleanser' | 'moisturizer' | 'sunscreen' | 'serum' | 'bad';
  position: {
    x: number;
    y: number;
  };
  animValue: Animated.Value;
}

export default function GameScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  const [highScore, setHighScore] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bubbleGenTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const bubbleTypes = ['cleanser', 'moisturizer', 'sunscreen', 'serum', 'bad'];
  
  // Function to generate a random bubble
  const generateBubble = () => {
    const id = Math.random().toString(36).substring(7);
    const type = bubbleTypes[Math.floor(Math.random() * bubbleTypes.length)];
    const x = Math.random() * (GAME_WIDTH - BUBBLE_SIZE);
    
    const newBubble: Bubble = {
      id,
      type,
      position: { x, y: -BUBBLE_SIZE },
      animValue: new Animated.Value(-BUBBLE_SIZE),
    };
    
    setBubbles(prev => [...prev, newBubble]);
    
    // Animate the bubble falling
    Animated.timing(newBubble.animValue, {
      toValue: GAME_WIDTH + BUBBLE_SIZE,
      duration: 4000 - (level * 500), // Speed increases with level
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        // Remove the bubble when animation is done
        setBubbles(prev => prev.filter(b => b.id !== id));
        
        // If it's a good bubble and it reached the bottom, decrease score
        if (type !== 'bad' && isPlaying) {
          setScore(prev => Math.max(0, prev - 1));
        }
      }
    });
  };
  
  // Start the game
  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setTime(60);
    setLevel(1);
    setBubbles([]);
    
    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Start bubble generation
    bubbleGenTimerRef.current = setInterval(generateBubble, 1000);
  };
  
  // Pause the game
  const pauseGame = () => {
    setIsPlaying(false);
    
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    
    if (bubbleGenTimerRef.current) {
      clearInterval(bubbleGenTimerRef.current);
      bubbleGenTimerRef.current = null;
    }
    
    // Pause all bubble animations
    bubbles.forEach(bubble => {
      bubble.animValue.stopAnimation();
    });
  };
  
  // Resume the game
  const resumeGame = () => {
    setIsPlaying(true);
    
    // Resume game timer
    gameTimerRef.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Resume bubble generation
    bubbleGenTimerRef.current = setInterval(generateBubble, 1000);
    
    // Resume all bubble animations
    bubbles.forEach(bubble => {
      // This is a simplified resume - in a real game, you'd need to calculate the remaining duration
      Animated.timing(bubble.animValue, {
        toValue: GAME_WIDTH + BUBBLE_SIZE,
        duration: 4000 - (level * 500),
        useNativeDriver: true,
      }).start();
    });
  };
  
  // End the game
  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    
    if (bubbleGenTimerRef.current) {
      clearInterval(bubbleGenTimerRef.current);
      bubbleGenTimerRef.current = null;
    }
    
    // Update high score
    if (score > highScore) {
      setHighScore(score);
    }
  };
  
  // Handle bubble press
  const onBubblePress = (id: string, type: string) => {
    if (!isPlaying) return;
    
    if (type === 'bad') {
      // Pressing a bad bubble reduces score
      setScore(prev => Math.max(0, prev - 2));
      Alert.alert("Oops!", "That was a harmful ingredient! -2 points");
    } else {
      // Pressing a good bubble increases score
      setScore(prev => prev + 1);
      
      // Level up every 10 points
      if ((score + 1) % 10 === 0) {
        setLevel(prev => prev + 1);
        Alert.alert("Level Up!", `You've reached level ${level + 1}`);
      }
    }
    
    // Remove the bubble
    setBubbles(prev => prev.filter(b => b.id !== id));
  };
  
  // Show game instructions
  const showInstructions = () => {
    Alert.alert(
      "Skincare Bubble Pop",
      "Pop the good skincare ingredients (cleansers, moisturizers, serums, sunscreens) to earn points. Avoid harmful ingredients that will reduce your score. Level up by earning more points, but beware - the game gets faster with each level!",
      [{ text: "Got it!" }]
    );
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (bubbleGenTimerRef.current) clearInterval(bubbleGenTimerRef.current);
    };
  }, []);
  
  // Render bubble based on type
  const renderBubble = (bubble: Bubble) => {
    let bubbleColor;
    
    switch (bubble.type) {
      case 'cleanser':
        bubbleColor = Colors.primary.default;
        break;
      case 'moisturizer':
        bubbleColor = Colors.secondary.default;
        break;
      case 'sunscreen':
        bubbleColor = Colors.warning.default;
        break;
      case 'serum':
        bubbleColor = Colors.accent.default;
        break;
      case 'bad':
        bubbleColor = Colors.error.default;
        break;
      default:
        bubbleColor = Colors.neutral.medium;
    }
    
    return (
      <Animated.View
        key={bubble.id}
        style={[
          styles.bubble,
          {
            backgroundColor: bubbleColor,
            left: bubble.position.x,
            transform: [{ translateY: bubble.animValue }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.bubbleButton}
          onPress={() => onBubblePress(bubble.id, bubble.type)}
        >
          <Typography variant="caption" color={Colors.neutral.white}>
            {bubble.type === 'bad' ? 'Bad' : bubble.type.charAt(0).toUpperCase() + bubble.type.slice(1, 3)}
          </Typography>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.accent.light, Colors.background.primary]}
        style={styles.headerGradient}
      />
      
      <View style={styles.header}>
        <Typography variant="h2">
          Skincare Bubble Pop
        </Typography>
        <TouchableOpacity onPress={showInstructions} style={styles.helpButton}>
          <HelpCircle size={24} color={Colors.primary.default} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.gameInfo}>
        <Card style={styles.scoreCard}>
          <Typography variant="h4" align="center">
            Score
          </Typography>
          <Typography variant="display" color={Colors.primary.default} align="center">
            {score}
          </Typography>
        </Card>
        
        <Card style={styles.timeCard}>
          <Typography variant="h4" align="center">
            Time
          </Typography>
          <Typography 
            variant="display" 
            color={time < 10 ? Colors.error.default : Colors.text.primary} 
            align="center"
          >
            {time}
          </Typography>
        </Card>
        
        <Card style={styles.levelCard}>
          <Typography variant="h4" align="center">
            Level
          </Typography>
          <Typography variant="display" color={Colors.secondary.default} align="center">
            {level}
          </Typography>
        </Card>
      </View>
      
      <View style={styles.gameContainer}>
        {!isPlaying && !gameOver && (
          <Card style={styles.startCard}>
            <Trophy size={40} color={Colors.primary.default} style={styles.trophyIcon} />
            <Typography variant="h3" align="center">
              Skincare Bubble Pop
            </Typography>
            <Typography variant="body" align="center" style={styles.instructionsText}>
              Pop skincare ingredient bubbles to earn points! Avoid harmful ingredients.
            </Typography>
            <Typography variant="bodySmall" align="center" style={styles.highScoreText}>
              High Score: {highScore}
            </Typography>
            <Button
              label="Start Game"
              variant="primary"
              size="lg"
              icon={<Play size={20} color={Colors.neutral.white} />}
              iconPosition="left"
              style={styles.startButton}
              onPress={startGame}
            />
          </Card>
        )}
        
        {gameOver && (
          <Card style={styles.gameOverCard}>
            <Typography variant="h3" align="center">
              Game Over!
            </Typography>
            <Typography variant="h2" color={Colors.primary.default} align="center" style={styles.finalScore}>
              {score}
            </Typography>
            <Typography variant="body" align="center">
              {score > highScore ? 'New High Score!' : 'Your Score'}
            </Typography>
            <Button
              label="Play Again"
              variant="primary"
              size="lg"
              icon={<RotateCcw size={20} color={Colors.neutral.white} />}
              iconPosition="left"
              style={styles.playAgainButton}
              onPress={startGame}
            />
          </Card>
        )}
        
        {isPlaying && (
          <View style={styles.gamePlayArea}>
            {bubbles.map(renderBubble)}
          </View>
        )}
      </View>
      
      {isPlaying && (
        <View style={styles.gameControls}>
          <Button
            label="Pause"
            variant="outline"
            size="md"
            icon={<PauseCircle size={20} color={Colors.primary.default} />}
            iconPosition="left"
            onPress={pauseGame}
          />
        </View>
      )}
      
      {!isPlaying && !gameOver && bubbles.length > 0 && (
        <View style={styles.gameControls}>
          <Button
            label="Resume"
            variant="primary"
            size="md"
            icon={<Play size={20} color={Colors.neutral.white} />}
            iconPosition="left"
            onPress={resumeGame}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    marginBottom: 24,
  },
  helpButton: {
    padding: 8,
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  scoreCard: {
    flex: 1,
    marginRight: 8,
    padding: 12,
  },
  timeCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
  },
  levelCard: {
    flex: 1,
    marginLeft: 8,
    padding: 12,
  },
  gameContainer: {
    flex: 1,
    paddingHorizontal: 24,
    position: 'relative',
  },
  startCard: {
    alignItems: 'center',
    padding: 24,
  },
  trophyIcon: {
    marginBottom: 16,
  },
  instructionsText: {
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
  },
  highScoreText: {
    marginBottom: 24,
    color: Colors.text.tertiary,
  },
  startButton: {
    paddingHorizontal: 32,
  },
  gameOverCard: {
    alignItems: 'center',
    padding: 24,
  },
  finalScore: {
    margin: 16,
  },
  playAgainButton: {
    marginTop: 24,
    paddingHorizontal: 32,
  },
  gamePlayArea: {
    width: GAME_WIDTH,
    flex: 1,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameControls: {
    padding: 24,
    alignItems: 'center',
  },
});
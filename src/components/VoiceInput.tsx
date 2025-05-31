
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice input error",
          description: "Could not process voice input. Please try again.",
          variant: "destructive",
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onTranscript, toast]);

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  if (!recognition) {
    return null; // Don't render if not supported
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={`h-9 w-9 rounded-lg transition-all ${
        isListening 
          ? "bg-red-500 hover:bg-red-600 text-white" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
      onClick={toggleListening}
      disabled={disabled}
    >
      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      <span className="sr-only">{isListening ? "Stop recording" : "Start voice input"}</span>
    </Button>
  );
}

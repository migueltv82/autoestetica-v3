import { 
  Zap, 
  Droplets, 
  Wrench, 
  ShieldCheck, 
  Sparkles, 
  Bike, 
  CarFront, 
  Star, 
  Settings,
  Shield,
  Clock,
  Camera,
  Trash2,
  Plus,
  Info
} from "lucide-react";

const icons = {
  Zap,
  Droplets,
  Wrench,
  ShieldCheck,
  Sparkles,
  Bike,
  CarFront,
  Star,
  Settings,
  Shield,
  Clock,
  Camera,
  Trash2,
  Plus,
  Info
};

/**
 * Returns a Lucide icon component based on its name.
 * @param {string} name - The name of the icon (e.g. "Zap", "Droplets")
 * @param {object} props - Props to pass to the icon component (size, color, etc.)
 */
export const getIcon = (name, props = {}) => {
  const IconComponent = icons[name] || icons.Info;
  return <IconComponent {...props} />;
};

/**
 * Returns a list of available icons for selection.
 */
export const getAvailableIcons = () => Object.keys(icons);

import React from 'react';
import { 
  Home, Shirt, Utensils, Gamepad2, Gift, ShoppingCart, HeartPulse, 
  MoreHorizontal, Dog, ShoppingBag, RefreshCw, Car, Lightbulb, 
  Coins, Banknote, Wallet, Tag, Receipt, CreditCard, Plane, 
  GraduationCap, Baby, Dumbbell, Coffee, Music, Smartphone,
  Wifi, Droplets, Zap, Fuel, Bus, Train, Bike, Pizza,
  UtensilsCrossed, Wine, IceCream, Popcorn, Tv, Camera,
  Palette, BookOpen, Scissors, Stethoscope, Pill, Eye,
  Umbrella, Shield, Star, Heart, Gem, Crown, Target, Trophy,
  type LucideIcon
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  shirt: Shirt,
  utensils: Utensils,
  'gamepad-2': Gamepad2,
  gift: Gift,
  'shopping-cart': ShoppingCart,
  'heart-pulse': HeartPulse,
  'more-horizontal': MoreHorizontal,
  dog: Dog,
  'shopping-bag': ShoppingBag,
  'refresh-cw': RefreshCw,
  car: Car,
  lightbulb: Lightbulb,
  coins: Coins,
  banknote: Banknote,
  wallet: Wallet,
  tag: Tag,
  receipt: Receipt,
  'credit-card': CreditCard,
  plane: Plane,
  'graduation-cap': GraduationCap,
  baby: Baby,
  dumbbell: Dumbbell,
  coffee: Coffee,
  music: Music,
  smartphone: Smartphone,
  wifi: Wifi,
  droplets: Droplets,
  zap: Zap,
  fuel: Fuel,
  bus: Bus,
  train: Train,
  bike: Bike,
  pizza: Pizza,
  'utensils-crossed': UtensilsCrossed,
  wine: Wine,
  'ice-cream': IceCream,
  popcorn: Popcorn,
  tv: Tv,
  camera: Camera,
  palette: Palette,
  'book-open': BookOpen,
  scissors: Scissors,
  stethoscope: Stethoscope,
  pill: Pill,
  eye: Eye,
  umbrella: Umbrella,
  shield: Shield,
  star: Star,
  heart: Heart,
  gem: Gem,
  crown: Crown,
  target: Target,
  trophy: Trophy,
};

export const ICON_KEYS = Object.keys(ICON_MAP);

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: number;
}

export default function CategoryIcon({ icon, color, size = 40 }: CategoryIconProps) {
  const Icon = ICON_MAP[icon] || MoreHorizontal;
  return (
    <div
      className="rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: color + '20' }}
    >
      <Icon className="w-1/2 h-1/2" style={{ color }} />
    </div>
  );
}

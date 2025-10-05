import logoImage from '../assets/6774daf17ccef97bebb1bd19b41e6c57f42afb54.png';

interface WebLogoProps {
  className?: string;
}

export function WebLogo({ className = "w-16 h-16" }: WebLogoProps) {
  return (
    <img 
      src={logoImage} 
      alt="Eclipse Reads Logo" 
      className={className}
    />
  );
}
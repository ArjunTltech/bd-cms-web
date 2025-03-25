import { Loader2 } from 'lucide-react';

const Loader = ({ 
  text = 'Loading...', 
  className = '', 
  textClassName = '',
  iconSize = 48,
  iconClassName = ''
}) => (
  <div className={`flex justify-center items-center h-full w-full py-20 ${className}`}>
    <div className="flex flex-col items-center">
      <div className="relative">
        <Loader2 
          className={`animate-spin text-primary ${iconClassName}`} 
          size={iconSize} 
        />
      </div>
      <p className={`mt-4 text-base-content/70 ${textClassName}`}>
        {text}
      </p>
    </div>
  </div>
);

export default Loader;
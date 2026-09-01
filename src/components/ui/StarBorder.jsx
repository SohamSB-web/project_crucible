import './StarBorder.css';

const StarBorder = ({
  as: Component = 'button',
  className = '',
  color = '#71a7ff',
  speed = '6s',
  thickness = 1,
  backgroundColor = '#142034',
  textColor = '#ffffff',
  borderColor = 'rgba(113, 167, 255, 0.4)',
  children,
  onClick,
  type = 'button',
  style = {},
  ...rest
}) => {
  return (
    <Component
      type={Component === 'button' ? type : undefined}
      onClick={onClick}
      className={`star-border-container ${className}`}
      style={{
        padding: `${thickness}px`,
        ...style,
      }}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      ></div>
      <div className="inner-content" style={{ background: backgroundColor, color: textColor, border: `1px solid ${borderColor}` }}>
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;

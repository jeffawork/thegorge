// For CSS modules like styles.module.css
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// For global CSS files like globals.css
declare module '*.css';

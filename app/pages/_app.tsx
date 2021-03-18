import '../styles/globals.css';

const MyApp = ({
  Component,
  pageProps,
}: {
  Component: React.FunctionComponent<any>;
  pageProps: object;
}) => {
  return <Component {...pageProps} />;
};

export default MyApp;

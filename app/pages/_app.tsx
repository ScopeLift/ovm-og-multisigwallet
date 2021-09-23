import '../styles/globals.css';
import Head from 'next/head';
import { WithModal } from 'components/Modal';
import { WithToast, Toast } from 'components/Toast';
import { Web3Provider } from '@ethersproject/providers';
import { Web3ReactProvider } from '@web3-react/core';
import { ChainId } from 'components/ChainId';
import { BlockNumber } from 'components/BlockNumber';
import { NetworkName } from 'components/NetworkName';
import { Connection } from 'components/Connection';
function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

const MyApp = ({
  Component,
  pageProps,
}: {
  Component: React.FunctionComponent<any>;
  pageProps: object;
}) => {
  return (
    <>
      <Head>
        <title>OG Gnosis Multisig on OVM</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Web3ReactProvider getLibrary={getLibrary}>
        <WithModal>
          <WithToast>
            <div className="container mx-auto px-4 pb-4">
              <div className="flex justify-end mt-2">
                <ChainId />
                <BlockNumber />
                <NetworkName />
                <Connection />
              </div>
              <div className="mt-4">
                <Toast />
                <Component {...pageProps} />
              </div>
            </div>
          </WithToast>
        </WithModal>
      </Web3ReactProvider>
    </>
  );
};

export default MyApp;

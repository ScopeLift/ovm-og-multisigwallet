import { FC, useRef, useEffect } from 'react';
import jazzicon from '@metamask/jazzicon';
import { addressToNumber } from 'utils/utils';

interface JazziconProps {
  address: string;
}

const Jazzicon: FC<JazziconProps> = ({ address }) => {
  const jazziconRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (!address || !jazziconRef.current || jazziconRef.current.childElementCount) return;

    const accountjazziconID = addressToNumber(address);
    const jazziconEl = jazzicon(16, accountjazziconID);
    jazziconRef.current?.appendChild(jazziconEl);
  }, [address]);

  return <div className="ml-2" ref={jazziconRef} />;
};
export default Jazzicon;

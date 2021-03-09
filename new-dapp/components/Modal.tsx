import { useRef } from 'react';
import { useOutsideAlerter } from 'hooks/OutsideAlerter';

export const Modal = ({ children, closeModal }) => {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  return (
    <div className="fixed inset-0 w-full h-full z-20 bg-black bg-opacity-50 duration-300 overflow-y-auto">
      <div
        ref={wrapperRef}
        className="relative sm:w-3/4 md:w-1/2 lg:w-1/3 mx-2 sm:mx-auto my-10 opacity-100"
      >
        <div className="bg-white shadow-lg rounded-md text-gray-900 z-20 p-5">{children}</div>
      </div>
    </div>
  );
};

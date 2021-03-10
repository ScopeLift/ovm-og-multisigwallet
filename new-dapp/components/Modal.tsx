import { useRef } from 'react';
import { useOutsideAlerter } from 'hooks/OutsideAlerter';
import { createContext, useState, useContext } from 'react';

type ContextProps = {
  visible: boolean;
  content: any[];
  setModalVisible: Function;
  setModalContent: Function;
  clearModal: Function;
};

export const ModalContext = createContext<Partial<ContextProps>>({
  visible: false,
  content: [],
  setModalVisible: () => {},
  setModalContent: () => {},
  clearModal: () => {},
});

export const WithModal = ({ children }) => {
  const [visible, setModalVisible] = useState(false);
  const [content, setModalContent] = useState([]);
  const clearModal = () => {
    setModalVisible(false);
    setModalContent([]);
  };
  return (
    <ModalContext.Provider
      value={{
        visible,
        content,
        setModalVisible,
        setModalContent,
        clearModal,
      }}
    >
      <div className={!visible ? 'hidden' : ''}>
        <Modal>{content}</Modal>
      </div>
      {children}
    </ModalContext.Provider>
  );
};

export const Modal = ({ children }) => {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  return (
    <div className="fixed inset-0 w-full h-full z-20 bg-black bg-opacity-50 duration-300 overflow-y-auto">
      <div
        ref={wrapperRef}
        className="relative sm:w-3/4 md:w-1/2 lg:w-1/2 mx-2 sm:mx-auto my-10 opacity-100"
      >
        <div className="bg-white shadow-lg rounded-md text-gray-900 z-20">{children}</div>
      </div>
    </div>
  );
};

import { useRef } from 'react';
import { useOutsideAlerter } from 'hooks/OutsideAlerter';
import { createContext, useState, useContext } from 'react';

type ContextProps = {
  visible: boolean;
  content: any[];
  setModalVisible: Function;
  setModalContent: Function;
  clearModal: Function;
  setModal: Function;
};

export const ModalContext = createContext<Partial<ContextProps>>({
  visible: false,
  content: [],
  setModalVisible: () => {},
  setModalContent: () => {},
  clearModal: () => {},
  setModal: () => {},
});

export const WithModal = ({ children }) => {
  const [visible, setModalVisible] = useState(false);
  const [content, setModalContent] = useState([]);
  const [styleClass, setStyleClass] = useState('');
  const clearModal = () => {
    setModalVisible(false);
    setModalContent([]);
  };
  const setModal = ({ content, styleClass }) => {
    setModalVisible(true);
    setModalContent(content);
    setStyleClass(styleClass);
  };
  return (
    <ModalContext.Provider
      value={{
        visible,
        content,
        setModalVisible,
        setModalContent,
        clearModal,
        setModal,
      }}
    >
      <div className={!visible ? 'hidden' : ''}>
        <Modal styleClass={styleClass}>{content}</Modal>
      </div>
      {children}
    </ModalContext.Provider>
  );
};

export const Modal = ({ children, styleClass = 'w-1/2' }) => {
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  return (
    <div className="fixed flex justify-center items-center inset-0 w-full h-full z-20 bg-black bg-opacity-50 duration-300 overflow-y-auto">
      <div ref={wrapperRef} className={'mx-2 sm:mx-auto my-10 opacity-100 ' + styleClass}>
        <div className="bg-white shadow-lg rounded-md overflow-hidden text-gray-900 z-20">
          {children}
        </div>
      </div>
    </div>
  );
};

import { createContext, useState } from 'react';

import { Modal } from 'components/Modal';

type ContextProps = {
  visible: boolean;
  content: any[];
  setVisible: Function;
  setContent: Function;
};

export const ModalStateContext = createContext<Partial<ContextProps>>({
  visible: false,
  content: [],
  setVisible: () => {},
  setContent: () => {},
});

export const WithModal = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState([]);
  const setBoth = (visible, content) => {
    setVisible(visible);
    setContent(content);
  };
  return (
    <ModalStateContext.Provider
      value={{
        visible,
        content,
        setVisible,
        setContent,
      }}
    >
      <div className={visible ? '' : 'hidden'}>
        <Modal closeModal={() => setBoth(false, [])}>{content}</Modal>
      </div>
      {children}
    </ModalStateContext.Provider>
  );
};

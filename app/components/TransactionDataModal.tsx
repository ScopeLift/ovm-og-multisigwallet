import { FC, useContext } from 'react';
import { Modal, ModalContext } from 'components/Modal';
import { CloseIcon } from 'components/Images';

interface TransactionDataModalProps {
  data: string;
}

export const TransactionDataModal: FC<TransactionDataModalProps> = ({ data }) => {
  const { clearModal } = useContext(ModalContext);

  return (
    <Modal>
      <div className="flex justify-between w-full bg-gray-200 p-3 font-semibold">
        <h2>Transaction Data</h2>
        <CloseIcon
          className="opacity-50 hover:opacity-80 hover:cursor-pointer"
          onClick={() => clearModal()}
        />
      </div>
      <div className="p-5">{data}</div>
    </Modal>
  );
};

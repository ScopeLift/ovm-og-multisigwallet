import { FC, useContext } from 'react';
import { Modal, ModalContext } from 'components/Modal';
import { CloseIcon } from 'components/Images';

interface TransactionDataModalProps {
  txId: number;
  data: string;
}

export const TransactionDataModal: FC<TransactionDataModalProps> = ({ txId, data }) => {
  const { clearModal } = useContext(ModalContext);

  return (
    <Modal>
      <div className="flex justify-between w-full bg-gray-200 p-3 font-semibold">
        <h2>Transaction {txId} Data</h2>
        <CloseIcon
          className="opacity-50 hover:opacity-80 hover:cursor-pointer"
          onClick={() => clearModal()}
        />
      </div>
      <div className="p-5 break-words">{data}</div>
    </Modal>
  );
};

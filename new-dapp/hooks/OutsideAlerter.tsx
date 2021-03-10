import { Modal } from 'components/Modal';
import { useEffect, useContext } from 'react';
import { ModalContext } from 'components/Modal';

/**
 * Hook that alerts clicks outside of the passed ref
 */
export const useOutsideAlerter = (ref) => {
  const { setModalVisible, setModalContent } = useContext(ModalContext);
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setModalVisible(false);
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
};

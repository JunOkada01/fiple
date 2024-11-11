import styles from './SuccessCancel.module.css';

const SuccessPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ご購入ありがとうございました！</h1>
      <p className={styles.message}>決済が成功しました。</p>
    </div>
  );
};

export default SuccessPage;

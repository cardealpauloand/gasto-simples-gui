ALTER TABLE transactions_installments
  ADD COLUMN account_out_id UUID REFERENCES account(id);

CREATE INDEX idx_transactions_installments_account_out_id
  ON transactions_installments(account_out_id);

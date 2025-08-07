-- Tabela de Usuários (usando UUID para compatibilidade com Supabase Auth)
CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255),
    name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários
CREATE POLICY "Users can view own profile" ON "user" 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON "user" 
FOR UPDATE USING (auth.uid() = id);

-- Configurações do usuário
CREATE TABLE user_setting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    theme_dark BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_setting ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings" ON user_setting 
FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_user_setting_user_id ON user_setting(user_id);

-- Grupo de contas
CREATE TABLE account_group (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE account_group ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view account groups" ON account_group 
FOR SELECT USING (true);

-- Inserir grupos padrão
INSERT INTO account_group (name) VALUES 
('Conta Corrente'),
('Poupança'), 
('Investimentos'),
('Carteira'),
('Cartão de Crédito');

-- Contas
CREATE TABLE account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    account_group_id UUID REFERENCES account_group(id),
    initial_value INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE account ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own accounts" ON account 
FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_account_user_id ON account(user_id);
CREATE INDEX idx_account_group_id ON account(account_group_id);

-- Tipos de transações
CREATE TABLE transactions_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transactions_type ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view transaction types" ON transactions_type 
FOR SELECT USING (true);

-- Inserir tipos padrão
INSERT INTO transactions_type (name) VALUES 
('Receita'),
('Despesa'),
('Transferência');

-- Transações principais
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    account_id UUID REFERENCES account(id),
    account_out_id UUID REFERENCES account(id),
    transaction_type_id UUID REFERENCES transactions_type(id),
    total_installments INTEGER DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions" ON transactions 
FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_transactions_transaction_type_id ON transactions(transaction_type_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_account_out_id ON transactions(account_out_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Parcelas de uma transação
CREATE TABLE transactions_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value INTEGER NOT NULL,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    transaction_type_id UUID REFERENCES transactions_type(id),
    account_id UUID REFERENCES account(id),
    user_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    installment_number INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transactions_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own installments" ON transactions_installments 
FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_transactions_installments_transaction_id ON transactions_installments(transaction_id);
CREATE INDEX idx_transactions_installments_account_id ON transactions_installments(account_id);
CREATE INDEX idx_transactions_installments_user_id ON transactions_installments(user_id);
CREATE INDEX idx_transactions_installments_type_id ON transactions_installments(transaction_type_id);

-- Subtransações
CREATE TABLE transactions_sub (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transactions_installments_id UUID REFERENCES transactions_installments(id) ON DELETE CASCADE,
    value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transactions_sub ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sub-transactions" ON transactions_sub 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM transactions_installments ti 
        WHERE ti.id = transactions_installments_id 
        AND ti.user_id = auth.uid()
    )
);

CREATE INDEX idx_transactions_sub_installments_id ON transactions_sub(transactions_installments_id);

-- Categorias
CREATE TABLE category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE category ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view categories" ON category 
FOR SELECT USING (true);

-- Inserir categorias padrão
INSERT INTO category (name, color) VALUES 
('Comida', '#ef4444'),
('Lazer', '#8b5cf6'),
('Transporte', '#06b6d4'),
('Saúde', '#10b981'),
('Educação', '#f59e0b'),
('Casa', '#84cc16'),
('Outros', '#6b7280');

-- Subcategorias
CREATE TABLE sub_category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category_id UUID REFERENCES category(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE sub_category ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view sub-categories" ON sub_category 
FOR SELECT USING (true);

-- Inserir subcategorias padrão
INSERT INTO sub_category (name, category_id) VALUES 
('Hamburguer', (SELECT id FROM category WHERE name = 'Comida')),
('Sorvete', (SELECT id FROM category WHERE name = 'Comida')),
('Cinema', (SELECT id FROM category WHERE name = 'Lazer')),
('Games', (SELECT id FROM category WHERE name = 'Lazer'));

-- Categoria associada a subtransações
CREATE TABLE transactions_category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transactions_sub_id UUID REFERENCES transactions_sub(id) ON DELETE CASCADE,
    category_id UUID REFERENCES category(id),
    sub_category_id UUID REFERENCES sub_category(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transactions_category ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage transaction categories" ON transactions_category 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM transactions_sub ts
        JOIN transactions_installments ti ON ts.transactions_installments_id = ti.id
        WHERE ts.id = transactions_sub_id 
        AND ti.user_id = auth.uid()
    )
);

CREATE INDEX idx_transactions_category_sub_id ON transactions_category(transactions_sub_id);
CREATE INDEX idx_transactions_category_category_id ON transactions_category(category_id);
CREATE INDEX idx_transactions_category_sub_category_id ON transactions_category(sub_category_id);

-- Tags
CREATE TABLE tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tag ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view tags" ON tag 
FOR SELECT USING (true);

-- Tags associadas a parcelas
CREATE TABLE transactions_tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transactions_installments_id UUID REFERENCES transactions_installments(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tag(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transactions_tag ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage transaction tags" ON transactions_tag 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM transactions_installments ti 
        WHERE ti.id = transactions_installments_id 
        AND ti.user_id = auth.uid()
    )
);

CREATE INDEX idx_transactions_tag_installments_id ON transactions_tag(transactions_installments_id);
CREATE INDEX idx_transactions_tag_tag_id ON transactions_tag(tag_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para user
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user" 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
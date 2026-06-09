import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "../../../styles/AdicionarMesa.module.css";

export default function AdicionarMesa() {
    const navigate = useNavigate();
    const [mesas, setMesas] = useState([]);
    const [numero, setNumero] = useState('');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmandoExcluir, setConfirmandoExcluir] = useState(null);

    useEffect(() => {
        const usuarioStr = localStorage.getItem("usuario");
        if (!usuarioStr) { navigate('/'); return; }
        const usuario = JSON.parse(usuarioStr);
        if (Number(usuario.id_tipo) !== 1) { navigate('/dashboard'); return; }
        buscarMesas();
    }, []);

    const buscarMesas = async () => {
        try {
            const res = await fetch('http://127.0.0.1:5000/mesas', { credentials: 'include' });
            const data = await res.json();
            setMesas(data);
        } catch {
            setErro('Erro ao carregar mesas.');
        }
    };

    const numerosDisponiveis = Array.from({ length: 10 }, (_, i) => i + 1)
        .filter(n => !mesas.some(m => m.numero === n));

    const handleAdicionar = async () => {
        if (!numero) {
            setErro('Selecione um número de mesa.');
            setTimeout(() => setErro(''), 3000);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:5000/mesa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ numero: parseInt(numero) })
            });
            const data = await res.json();
            if (res.ok) {
                setSucesso(`Mesa ${numero} adicionada!`);
                setNumero('');
                buscarMesas();
                setTimeout(() => setSucesso(''), 3000);
            } else {
                setErro(data.erro || 'Erro ao adicionar mesa.');
                setTimeout(() => setErro(''), 3000);
            }
        } catch {
            setErro('Erro de conexão.');
            setTimeout(() => setErro(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleExcluir = async (id) => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/mesa/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setSucesso('Mesa excluída!');
                buscarMesas();
                setTimeout(() => setSucesso(''), 3000);
            } else {
                setErro(data.erro || 'Erro ao excluir.');
                setTimeout(() => setErro(''), 3000);
            }
        } catch {
            setErro('Erro de conexão.');
            setTimeout(() => setErro(''), 3000);
        } finally {
            setConfirmandoExcluir(null);
        }
    };

    return (
        <div className={styles.pageContainer}>

            {confirmandoExcluir !== null && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalIcone}>🗑️</div>
                        <h3 className={styles.modalTitulo}>Excluir mesa?</h3>
                        <p className={styles.modalTexto}>Esta ação não pode ser desfeita.</p>
                        <div className={styles.modalBotoes}>
                            <button className={styles.modalBtnCancelar} onClick={() => setConfirmandoExcluir(null)}>Cancelar</button>
                            <button className={styles.modalBtnConfirmar} onClick={() => handleExcluir(confirmandoExcluir)}>Sim, excluir</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.header}>
                <button className={styles.btnVoltar} onClick={() => navigate('/dashboard')}>← Voltar</button>
                <h1 className={styles.title}>Gerenciar Mesas</h1>
            </div>

            {erro && <div className={styles.toast + ' ' + styles.toastErro}><span>✕</span><span>{erro}</span></div>}
            {sucesso && <div className={styles.toast + ' ' + styles.toastSucesso}><span>✓</span><span>{sucesso}</span></div>}

            <div className={styles.card}>
                <h2 className={styles.cardTitulo}>Adicionar Mesa</h2>
                <p className={styles.cardSubtitulo}>{mesas.length}/10 mesas cadastradas</p>

                {mesas.length < 10 ? (
                    <div className={styles.formRow}>
                        <select
                            className={styles.select}
                            value={numero}
                            onChange={e => setNumero(e.target.value)}
                        >
                            <option value="">Selecione o número...</option>
                            {numerosDisponiveis.map(n => (
                                <option key={n} value={n}>Mesa {n}</option>
                            ))}
                        </select>
                        <button className={styles.btnAdicionar} onClick={handleAdicionar} disabled={loading}>
                            {loading ? 'Adicionando...' : '+ Adicionar'}
                        </button>
                    </div>
                ) : (
                    <p className={styles.limiteTexto}>⚠️ Limite de 10 mesas atingido.</p>
                )}
            </div>

            <div className={styles.card}>
                <h2 className={styles.cardTitulo}>Mesas Cadastradas</h2>
                {mesas.length === 0 ? (
                    <p className={styles.emptyText}>Nenhuma mesa cadastrada ainda.</p>
                ) : (
                    <div className={styles.mesasGrid}>
                        {[...mesas].sort((a, b) => a.numero - b.numero).map(mesa => (
                            <div key={mesa.id} className={styles.mesaCard}>
                                <div className={styles.mesaNumero}>Mesa {mesa.numero}</div>
                                <div className={`${styles.mesaStatus} ${mesa.status === 'disponivel' ? styles.statusDisponivel : styles.statusOcupada}`}>
                                    {mesa.status === 'disponivel' ? 'Disponível' : 'Ocupada'}
                                </div>
                                <button className={styles.btnExcluirMesa} onClick={() => setConfirmandoExcluir(mesa.id)}>
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
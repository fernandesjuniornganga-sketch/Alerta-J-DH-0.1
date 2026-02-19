import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { EMERGENCY_NUMBERS } from '@/lib/storage';
import { makeCall } from '@/lib/alerts';

interface ResourcesScreenProps {
  onBack: () => void;
}

interface ResourceItem {
  title: string;
  content: string;
  category: string;
  icon: string;
}

const RESOURCES: ResourceItem[] = [
  {
    title: 'O que é violência de género?',
    content: 'A violência de género inclui qualquer acto de violência que resulte, ou possa resultar, em dano físico, sexual, psicológico ou económico para a mulher ou menina, incluindo ameaças, coerção ou privação da liberdade.\n\nInclui:\n\n\u2022 Violência física: agressões, empurrões, queimaduras\n\u2022 Violência psicológica: humilhações, ameaças, controlo excessivo\n\u2022 Violência sexual: qualquer acto sexual forçado\n\u2022 Violência económica: controlo de dinheiro, impedir de trabalhar\n\u2022 Violência patrimonial: destruição de bens pessoais',
    category: 'conhecimento',
    icon: 'information-circle',
  },
  {
    title: 'Reconheça os sinais de alerta',
    content: 'Sinais de que você ou alguém pode estar em situação de violência:\n\n\u2022 O parceiro controla onde vai, com quem fala ou o que veste\n\u2022 Isolamento da família e amigos\n\u2022 Ciúmes excessivos e possessividade\n\u2022 Gritos, insultos e humilhações frequentes\n\u2022 Destruição de objectos pessoais\n\u2022 Ameaças de violência contra si ou contra os filhos\n\u2022 Pressão ou forçar relações sexuais\n\u2022 Controlo do dinheiro e das finanças\n\u2022 Verificação constante do telemóvel\n\nSe reconhece 3 ou mais destes sinais, procure ajuda.',
    category: 'prevencao',
    icon: 'alert-circle',
  },
  {
    title: 'Violência contra menores',
    content: 'Crianças e adolescentes merecem protecção especial:\n\n\u2022 Todo o abuso sexual contra menores é crime em Angola\n\u2022 A denúncia é obrigatória para quem tiver conhecimento\n\u2022 O INAC (145) recebe denúncias de violência contra menores\n\u2022 Sinais em crianças: medo excessivo de adultos, mudança repentina de comportamento, lesões inexplicáveis, isolamento\n\u2022 Casamento infantil é ilegal em Angola\n\nDireitos da criança pela Lei de Protecção da Criança de Angola:\n\u2022 Direito à integridade física e psicológica\n\u2022 Direito à protecção contra exploração\n\u2022 Direito a ser ouvida',
    category: 'menores',
    icon: 'people',
  },
  {
    title: 'Os seus direitos legais',
    content: 'Em Angola, a violência doméstica é crime (Lei 25/11):\n\n\u2022 Tem direito a apresentar queixa na polícia (113)\n\u2022 Pode solicitar medida de protecção ao tribunal\n\u2022 Os agressores podem ser presos e julgados\n\u2022 Tem direito a assistência médica gratuita\n\u2022 Os seus filhos são protegidos pela lei\n\nLeis importantes:\n\u2022 Lei Contra a Violência Doméstica (25/11)\n\u2022 Código Penal Angolano\n\u2022 Lei de Protecção da Criança\n\u2022 Lei de Proteção de Dados Pessoais\n\nNenhuma tradição ou costume justifica a violência.',
    category: 'direitos',
    icon: 'shield-checkmark',
  },
  {
    title: 'Plano de segurança pessoal',
    content: 'Se está em situação de perigo, prepare um plano:\n\n1. Memorize os números de emergência: Polícia (113), Bombeiros (190), Criança (145), Mulher (180)\n2. Tenha sempre documentos importantes prontos (BI, certidões)\n3. Guarde dinheiro de emergência num local seguro\n4. Identifique vizinhos ou locais seguros para fugir\n5. Combine um código secreto com alguém de confiança\n6. Configure este app no disfarce de calculadora\n7. Mantenha o telemóvel sempre carregado\n8. Saiba onde ficam os postos seguros mais próximos\n9. Se possível, guarde roupa e itens essenciais num saco pronto\n10. Confie no seu instinto - se sente perigo, procure ajuda',
    category: 'seguranca',
    icon: 'lock-closed',
  },
  {
    title: 'Onde procurar ajuda em Angola',
    content: 'Recursos disponíveis:\n\nLinhas de emergência:\n\u2022 Polícia Nacional: 113\n\u2022 Bombeiros: 190\n\u2022 Linha da Criança (INAC): 145\n\u2022 Linha da Mulher: 180\n\nOrganizações:\n\u2022 Rede Mulher Angola: apoio jurídico e psicológico\n\u2022 MINFAMU: Ministério da Família, apoio institucional\n\u2022 Associação Mãos Livres: apoio a vítimas\n\u2022 INAC: protecção de crianças\n\nHospitais com atendimento especializado:\n\u2022 Hospital Josina Machel (Luanda)\n\u2022 Maternidade Lucrécia Paím (Luanda)\n\nUse este app para encontrar o posto seguro mais próximo.',
    category: 'ajuda',
    icon: 'heart',
  },
  {
    title: 'Como apoiar uma vítima',
    content: 'Se conhece alguém em situação de violência:\n\n\u2022 Ouça sem julgar - não pergunte "porque não saiu?"\n\u2022 Acredite na pessoa - falsas denúncias são raras\n\u2022 Não force decisões - respeite o tempo da vítima\n\u2022 Ofereça ajuda prática (abrigo, transporte, comida)\n\u2022 Partilhe informações sobre recursos disponíveis\n\u2022 Mantenha confidencialidade absoluta\n\u2022 Não confronte o agressor directamente\n\u2022 Ajude a criar um plano de segurança\n\u2022 Esteja disponível sem pressionar\n\nA sua presença e apoio podem salvar uma vida.',
    category: 'apoio',
    icon: 'hand-left',
  },
  {
    title: 'Violência digital e tecnológica',
    content: 'Formas de violência online:\n\n\u2022 Monitorização do telemóvel sem consentimento\n\u2022 Partilha de fotos íntimas sem autorização\n\u2022 Cyberstalking e perseguição online\n\u2022 Controlo de redes sociais\n\u2022 Ameaças por mensagens\n\nComo se proteger:\n\u2022 Use senhas fortes e diferentes para cada conta\n\u2022 Active a verificação em 2 passos\n\u2022 Não partilhe localização em tempo real\n\u2022 Use este app com disfarce para proteger a sua privacidade\n\u2022 Denuncie assédio online à polícia\n\u2022 A partilha não consentida de imagens íntimas é crime',
    category: 'digital',
    icon: 'phone-portrait',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  conhecimento: '#4A90D9',
  prevencao: '#E67E22',
  menores: '#9B59B6',
  direitos: '#27AE60',
  seguranca: Colors.primary,
  ajuda: '#E74C3C',
  apoio: '#F39C12',
  digital: '#3498DB',
};

function ResourceCard({
  resource,
  isExpanded,
  onToggle,
}: {
  resource: ResourceItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const categoryColor = CATEGORY_COLORS[resource.category] || Colors.primary;

  return (
    <Pressable
      onPress={onToggle}
      style={[styles.resourceCard, isExpanded && { borderLeftColor: categoryColor }]}
    >
      <View style={styles.resourceHeader}>
        <View style={[styles.resourceIconWrap, { backgroundColor: categoryColor + '20' }]}>
          <Ionicons
            name={resource.icon as any}
            size={22}
            color={categoryColor}
          />
        </View>
        <Text style={styles.resourceTitle} numberOfLines={isExpanded ? undefined : 1}>
          {resource.title}
        </Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.textSecondary}
        />
      </View>
      {isExpanded && (
        <View style={styles.resourceBody}>
          <View style={[styles.resourceDivider, { backgroundColor: categoryColor + '40' }]} />
          <Text style={styles.resourceContent}>{resource.content}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function ResourcesScreen({ onBack }: ResourcesScreenProps) {
  const insets = useSafeAreaInsets();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Prevenção e Direitos</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.emergencyBanner}>
        <View style={styles.bannerLeft}>
          <Ionicons name="warning" size={20} color={Colors.danger} />
          <Text style={styles.bannerText}>Em perigo agora?</Text>
        </View>
        <View style={styles.bannerActions}>
          <Pressable
            onPress={() => makeCall(EMERGENCY_NUMBERS.policia)}
            style={styles.bannerBtn}
          >
            <Ionicons name="call" size={16} color={Colors.white} />
            <Text style={styles.bannerBtnText}>113</Text>
          </Pressable>
          <Pressable
            onPress={() => makeCall(EMERGENCY_NUMBERS.mulher)}
            style={[styles.bannerBtn, { backgroundColor: '#9B59B6' }]}
          >
            <Ionicons name="call" size={16} color={Colors.white} />
            <Text style={styles.bannerBtnText}>180</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionIntro}>
          Conhecimento é poder. Aprenda sobre os seus direitos e como se proteger.
        </Text>

        {RESOURCES.map((resource, index) => (
          <ResourceCard
            key={index}
            resource={resource}
            isExpanded={expandedIndex === index}
            onToggle={() => toggleExpand(index)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.danger + '15',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.danger + '30',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.danger,
  },
  bannerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.danger,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  bannerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  sectionIntro: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  resourceCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.border,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resourceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  resourceBody: {
    marginTop: 14,
  },
  resourceDivider: {
    height: 1,
    marginBottom: 14,
    borderRadius: 1,
  },
  resourceContent: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});

import { components } from '@/constants/Components';
import { spacing } from '@/constants/Spacing';
import { typography } from '@/constants/Typography';
import dayjs from 'dayjs';
import { Card, Text } from 'react-native-paper';

type Props = {
  photoTitle: string;
  photoDescription: string | null;
  photoLocation: string | null;
  photoUri: string;
  createdDate: Date;
};
export default function UserPhotoCard(props: Props) {
  const { photoTitle, photoDescription, photoLocation, photoUri, createdDate } =
    props;

  return (
    <Card
      style={{
        borderRadius: components.card.style.borderRadius,
        margin: spacing.md,
        overflow: 'hidden',
      }}
    >
      {/* Photo */}
      <Card.Cover
        style={{
          height: 500,
          borderRadius: 0,
        }}
        source={{ uri: photoUri }}
      />
      {/* Title and description */}
      <Card.Content style={{ paddingTop: spacing.md }}>
        <Text style={{ ...typography.title, marginBottom: spacing.xs }}>
          {photoTitle}
        </Text>
        {photoDescription && (
          <Text
            style={{
              marginBottom: spacing.sm,
            }}
          >
            {photoDescription}
          </Text>
        )}

        {/* Location */}
        {photoLocation && (
          <Text
            style={{
              marginBottom: spacing.xs,
            }}
          >
            📍 {photoLocation}
          </Text>
        )}

        {/* Date */}
        <Text style={{ ...typography.small }}>
          {dayjs(createdDate).format('YYYY-MM-DD')}
        </Text>
      </Card.Content>
    </Card>
  );
}

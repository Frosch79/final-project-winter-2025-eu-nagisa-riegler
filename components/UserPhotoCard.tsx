import dayjs from 'dayjs';
import { Card, Text } from 'react-native-paper';
import { components } from '../constants/Components';
import { spacing } from '../constants/Spacing';
import { typography } from '../constants/Typography';

export type Props = {
  photoTitle: string | null;
  photoDescription: string | null;
  photoLocation: string | null;
  photoUri: string;
  createdDate: Date;
};

export default function UserPhotoCard(props: Props) {
  const defaultImage = 'https://example.com/fallback.jpg';
  const { photoTitle, photoDescription, photoLocation, photoUri, createdDate } =
    props;
  const validUri =
    typeof photoUri === 'string' && photoUri.startsWith('http')
      ? photoUri
      : defaultImage;

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
        testID="photo-image"
        source={{ uri: validUri }}
      />
      {/* Title and description */}
      <Card.Content style={{ paddingTop: spacing.md }}>
        {photoTitle && (
          <Text
            testID="title"
            style={{ ...typography.title, marginBottom: spacing.xs }}
          >
            {photoTitle}
          </Text>
        )}
        {photoDescription && (
          <Text
            testID="description"
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
            testID="location"
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

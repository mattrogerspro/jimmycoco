import {CalculateMetadataFunction, Composition, Folder, Still} from "remotion";
import {getCampaign} from "./content/catalog";
import {
  ProCarouselSlide,
  proCarouselSlideSchema,
} from "./ProCarouselSlide";
import {
  StoryDrivenProOfferVideo,
  StoryDrivenProOfferVideoProps,
  storyDrivenProOfferVideoSchema,
} from "./StoryDrivenProOfferVideo";
import {getPlatformSpec} from "./platforms";

const FPS = 30;

const calculateMetadata: CalculateMetadataFunction<StoryDrivenProOfferVideoProps> = ({props}) => {
  const campaign = getCampaign(props.campaignSlug);
  const platform = getPlatformSpec(props.platform);
  return {
    width: platform.width,
    height: platform.height,
    durationInFrames: Math.round(campaign.durationSeconds * FPS),
    defaultOutName: `${props.platform}/${campaign.slug}.mp4`,
    props,
  };
};

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Video">
      <Composition
        id="Jimmy-Coco-Pro-Offer"
        component={StoryDrivenProOfferVideo}
        fps={FPS}
        durationInFrames={750}
        width={1080}
        height={1920}
        schema={storyDrivenProOfferVideoSchema}
        defaultProps={{
          campaignSlug: "salon-bottle-maths",
          platform: "instagram-reels",
          audioMode: "off",
        }}
        calculateMetadata={calculateMetadata}
      />
    </Folder>
    <Folder name="Carousels">
      <Still
        id="Jimmy-Coco-Carousel-Slide"
        component={ProCarouselSlide}
        width={1080}
        height={1350}
        schema={proCarouselSlideSchema}
        defaultProps={{
          campaignSlug: "salon-bottle-maths",
          platform: "instagram",
          slideIndex: 0,
        }}
      />
    </Folder>
  </>
);

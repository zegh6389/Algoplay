import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/services/iap_service.dart';
import '../../../shared/providers/premium_provider.dart';

// ═══════════════════════════════════════════════════════════════════════════════
/// Premium Page — Full-screen subscription / unlock page.
/// Displays feature comparison, pricing, and IAP purchase flow.
/// ═══════════════════════════════════════════════════════════════════════════════
class PremiumPage extends ConsumerStatefulWidget {
  const PremiumPage({super.key});

  @override
  ConsumerState<PremiumPage> createState() => _PremiumPageState();
}

class _PremiumPageState extends ConsumerState<PremiumPage> {
  bool _isPurchasing = false;

  Future<void> _handlePurchase() async {
    setState(() => _isPurchasing = true);

    try {
      final launched = await IAPService.instance.buyUnlockAll();
      if (mounted) {
        if (launched) {
          _showInfoSnackBar(
            'Purchase started. Premium unlocks after Google Play confirms it.',
          );
        } else {
          _showErrorSnackBar(
            'Purchase could not be started. Please try again.',
          );
        }
      }
    } catch (e, stack) {
      debugPrint('[PremiumPage] purchase threw: $e');
      debugPrint('[PremiumPage] stack: $stack');
      if (mounted) {
        _showErrorSnackBar('Something went wrong. Please try again.');
      }
    } finally {
      if (mounted) {
        setState(() => _isPurchasing = false);
      }
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.card,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.lgBorder),
        title: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.success100,
                borderRadius: AppRadius.mdBorder,
              ),
              alignment: Alignment.center,
              child: const Icon(
                Icons.check,
                color: AppColors.success600,
                size: 22,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Text('Welcome, Premium!', style: AppTypography.h3),
          ],
        ),
        content: Text(
          'You now have full access to all algorithms, games, and premium features. Happy learning!',
          style: AppTypography.body,
        ),
        actions: [
          FilledButton(
            onPressed: () => Navigator.of(context).pop(),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary500,
              shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBorder),
            ),
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBorder),
      ),
    );
  }

  void _showInfoSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.primary500,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBorder),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<bool>(premiumProvider, (previous, next) {
      if (previous == false && next) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            _showSuccessDialog();
          }
        });
      }
    });

    final isPremium = ref.watch(premiumProvider);

    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        top: false,
        child: CustomScrollView(
          slivers: [
            // ── App Bar ──
            SliverAppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              leading: IconButton(
                icon: const Icon(Icons.close, color: AppColors.textPrimary),
                onPressed: () => Navigator.of(context).maybePop(),
              ),
              pinned: true,
            ),

            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  // ── Header ──
                  _buildHeader(),
                  const SizedBox(height: AppSpacing.xl),

                  // ── Feature Comparison ──
                  _buildFeatureComparison(),
                  const SizedBox(height: AppSpacing.xl),

                  // ── What's Included ──
                  _buildWhatsIncluded(),
                  const SizedBox(height: AppSpacing.xl),

                  // ── Pricing Card ──
                  if (!isPremium) _buildPricingCard(),
                  const SizedBox(height: AppSpacing.xxl),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        // Premium icon
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.solarAmber, AppColors.secondary500],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: AppRadius.xlBorder,
            boxShadow: AppShadows.md,
          ),
          alignment: Alignment.center,
          child: const Icon(
            Icons.stars,
            color: AppColors.textInverse,
            size: 36,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),

        Text('Unlock AlgoPlay Premium', style: AppTypography.h1),
        const SizedBox(height: AppSpacing.sm),
        Text(
          'Supercharge your algorithm learning with\nunlimited access to all content.',
          textAlign: TextAlign.center,
          style: AppTypography.body.copyWith(color: AppColors.textSecondary),
        ),
      ],
    );
  }

  Widget _buildFeatureComparison() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: AppRadius.lgBorder,
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Feature Comparison', style: AppTypography.h3),
          const SizedBox(height: AppSpacing.lg),

          // Free vs Premium rows
          _ComparisonRow(
            feature: 'Algorithms',
            free: '5 included',
            premium: 'All 25+ algorithms',
          ),
          const Divider(height: AppSpacing.lg),
          _ComparisonRow(
            feature: 'Games',
            free: '2 games',
            premium: 'All 6 games',
          ),
          const Divider(height: AppSpacing.lg),
          _ComparisonRow(
            feature: 'Visualizers',
            free: 'Basic only',
            premium: 'All visualizers',
          ),
          const Divider(height: AppSpacing.lg),
          _ComparisonRow(
            feature: 'Leaderboard',
            free: 'Top 10',
            premium: 'Full rankings',
          ),
          const Divider(height: AppSpacing.lg),
          _ComparisonRow(
            feature: 'Ads',
            free: 'Occasional',
            premium: 'Ad-free experience',
          ),
        ],
      ),
    );
  }

  Widget _buildWhatsIncluded() {
    final features = [
      (
        icon: Icons.school,
        title: 'All Algorithms',
        desc: 'Learn 25+ algorithms with interactive examples',
      ),
      (
        icon: Icons.sports_esports,
        title: 'All Games',
        desc: 'Battle Arena, Grid Escape, Race Mode & more',
      ),
      (
        icon: Icons.visibility,
        title: 'Full Visualizers',
        desc: 'Step-by-step algorithm visualization',
      ),
      (
        icon: Icons.leaderboard,
        title: 'Full Leaderboard',
        desc: 'Compete with the global community',
      ),
      (
        icon: Icons.block,
        title: 'No Ads',
        desc: 'Distraction-free learning experience',
      ),
      (
        icon: Icons.restore,
        title: 'Lifetime Access',
        desc: 'One-time purchase, yours forever',
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("What's Included", style: AppTypography.h2),
        const SizedBox(height: AppSpacing.lg),
        ...features.map(
          (f) => _FeatureTile(icon: f.icon, title: f.title, desc: f.desc),
        ),
      ],
    );
  }

  Widget _buildPricingCard() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary500, AppColors.primary700],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: AppRadius.xlBorder,
        boxShadow: AppShadows.lg,
      ),
      child: Column(
        children: [
          // Price
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '\$',
                style: AppTypography.h2.copyWith(color: AppColors.textInverse),
              ),
              Text(
                '4',
                style: AppTypography.display.copyWith(
                  color: AppColors.textInverse,
                  fontSize: 64,
                  fontWeight: FontWeight.w900,
                ),
              ),
              Text(
                '.99',
                style: AppTypography.h2.copyWith(
                  color: AppColors.textInverse.withValues(alpha: 0.8),
                ),
              ),
            ],
          ),
          Text(
            'One-time purchase',
            style: AppTypography.caption.copyWith(
              color: AppColors.textInverse.withValues(alpha: 0.8),
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // CTA
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _isPurchasing ? null : _handlePurchase,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.textInverse,
                foregroundColor: AppColors.primary700,
                disabledBackgroundColor: AppColors.textInverse.withValues(
                  alpha: 0.6,
                ),
                disabledForegroundColor: AppColors.primary500,
                minimumSize: const Size.fromHeight(52),
                shape: RoundedRectangleBorder(borderRadius: AppRadius.mdBorder),
                textStyle: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              child: _isPurchasing
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppColors.primary500,
                      ),
                    )
                  : const Text('Unlock All — One Time'),
            ),
          ),
          const SizedBox(height: AppSpacing.md),

          // Restore
          TextButton(
            onPressed: () async {
              await IAPService.instance.restorePurchases();
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: const Text(
                      'Restore requested. Check your purchases.',
                    ),
                    backgroundColor: AppColors.success600,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(
                      borderRadius: AppRadius.mdBorder,
                    ),
                  ),
                );
              }
            },
            child: Text(
              'Restore Purchases',
              style: TextStyle(
                color: AppColors.textInverse.withValues(alpha: 0.9),
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Comparison row for feature table
// ═══════════════════════════════════════════════════════════════════════════════
class _ComparisonRow extends StatelessWidget {
  const _ComparisonRow({
    required this.feature,
    required this.free,
    required this.premium,
  });

  final String feature;
  final String free;
  final String premium;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(flex: 2, child: Text(feature, style: AppTypography.body)),
        Expanded(
          child: Text(
            free,
            style: AppTypography.caption.copyWith(color: AppColors.textMuted),
            textAlign: TextAlign.center,
          ),
        ),
        Expanded(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.check_circle,
                color: AppColors.success600,
                size: 16,
              ),
              const SizedBox(width: 4),
              Flexible(
                child: Text(
                  premium,
                  style: AppTypography.body.copyWith(
                    color: AppColors.primary700,
                    fontWeight: FontWeight.w600,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
/// Feature tile with icon, title, and description
// ═══════════════════════════════════════════════════════════════════════════════
class _FeatureTile extends StatelessWidget {
  const _FeatureTile({
    required this.icon,
    required this.title,
    required this.desc,
  });

  final IconData icon;
  final String title;
  final String desc;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primary50,
              borderRadius: AppRadius.mdBorder,
            ),
            alignment: Alignment.center,
            child: Icon(icon, color: AppColors.primary500, size: 22),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTypography.bodyBold),
                const SizedBox(height: 2),
                Text(desc, style: AppTypography.caption),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

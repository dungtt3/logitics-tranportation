using System.Reflection;
using NetArchTest.Rules;

namespace LogisticsDispatch.ArchitectureTests;

public sealed class LayerDependencyTests
{
    private const string Domain = "LogisticsDispatch.Domain";
    private const string Application = "LogisticsDispatch.Application";
    private const string Infrastructure = "LogisticsDispatch.Infrastructure";
    private const string Api = "LogisticsDispatch.Api";

    [Fact]
    public void Domain_does_not_depend_on_outer_layers()
    {
        var result = Types.InAssembly(Assembly.Load(Domain))
            .ShouldNot()
            .HaveDependencyOnAny(Application, Infrastructure, Api)
            .GetResult();

        result.IsSuccessful.Should().BeTrue(because: Describe(result));
    }

    [Fact]
    public void Application_does_not_depend_on_infrastructure_or_api()
    {
        var result = Types.InAssembly(Assembly.Load(Application))
            .ShouldNot()
            .HaveDependencyOnAny(Infrastructure, Api)
            .GetResult();

        result.IsSuccessful.Should().BeTrue(because: Describe(result));
    }

    private static string Describe(TestResult result) =>
        "these types violate the layer rule: " + string.Join(", ", result.FailingTypeNames ?? []);
}
